document.addEventListener("DOMContentLoaded", function () {
    particlesJS.load('particles-js', '/particles-config.json', function () {
        console.log("Particles.js loaded!");
    });
});

// Load TensorFlow.js model properly
let aiModel;
async function loadModel() {
    try {
        console.log("Loading AI Model...");
        aiModel = await toxicity.load(0.9);
        console.log("AI Model Loaded Successfully!");
    } catch (error) {
        console.error("Error loading AI Model:", error);
    }
}
loadModel();

function switchInput(type) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('emlFile').style.display = type === 'file' ? 'block' : 'none';
    document.getElementById('emailInput').style.display = type === 'file' ? 'none' : 'block';
    document.querySelector(`.tab-btn[onclick*="${type}"]`).classList.add('active');
}

function analyzeEmail() {
    const textInput = document.getElementById('emailInput').value;
    const fileInput = document.getElementById('emlFile').files[0];
    const resultsDiv = document.getElementById('results');
    const spinner = document.getElementById('loading-spinner');

    if (!textInput && !fileInput) {
        alert('Please paste email content or upload an .eml file!');
        return;
    }

    resultsDiv.innerHTML = "";
    spinner.style.display = "block";

    if (fileInput) {
        const reader = new FileReader();
        reader.onload = function (e) {
            processContent(e.target.result);
            spinner.style.display = "none";
        };
        reader.readAsText(fileInput);
    } else {
        setTimeout(() => {
            processContent(textInput);
            spinner.style.display = "none";
        }, 1500);
    }
}

async function processContent(content) {
    console.log("Processing email content...");
    const artifacts = extractArtifacts(content);
    artifacts.securityHeaders = analyzeSecurityHeaders(content);
    artifacts.phishingRisk = await analyzePhishingContent(artifacts.emailBody);
    artifacts.impersonationRisk = analyzeImpersonation(artifacts);
    artifacts.threatScore = calculateThreatScore(artifacts);
    displayResults(artifacts);
}

async function analyzePhishingContent(text) {
    if (!aiModel) {
        console.warn("AI Model not loaded yet! Using basic rule-based phishing detection.");
        return basicPhishingCheck(text);
    }
    try {
        const predictions = await aiModel.classify([text]);
        let flaggedIssues = [];

        predictions.forEach(prediction => {
            if (prediction.results[0].match) {
                flaggedIssues.push(prediction.label);
            }
        });
        return flaggedIssues;
    } catch (error) {
        console.error("AI Model failed to analyze phishing content:", error);
        return ["AI Model Error"];
    }
}

function calculateThreatScore(artifacts) {
    console.log("Calculating threat score...");
    let score = 0;
    if (artifacts.securityHeaders.warnings.length) score += 30;
    if (artifacts.phishingRisk.length) score += 40;
    if (artifacts.impersonationRisk.length) score += 20;
    if (artifacts.urls.length) score += artifacts.urls.length * 5;
    if (artifacts.ipAddresses.length) score += artifacts.ipAddresses.length * 3;
    return Math.min(score, 100);
}

function analyzeImpersonation(artifacts) {
    console.log("Analyzing impersonation attempts...");
    let warnings = [];
    if (artifacts.emailMetadata.returnPath && artifacts.emailMetadata.senderEmail) {
        if (!artifacts.emailMetadata.returnPath.includes(artifacts.emailMetadata.senderEmail.split('@')[1])) {
            warnings.push("Return-Path differs from Sender Email (possible spoofing)");
        }
    }
    return warnings;
}

function basicPhishingCheck(text) {
    const phishingIndicators = ["urgent", "reset your password", "click here", "verify account", "free gift", "you have won"];
    return phishingIndicators.some(indicator => text.toLowerCase().includes(indicator)) ? ["Phishing-like content detected"] : [];
}

function extractArtifacts(emlContent) {
    console.log("Extracting email artifacts...");
    const artifacts = {
        emailMetadata: {},
        emailBody: "",
        ipAddresses: [],
        urls: [],
        securityHeaders: { risks: [], info: [] },  // ✅ Ensure this is initialized
        messageId: "",
        receivedHeaders: [],
        phishingRisk: [],   // ✅ Ensure these arrays exist
        impersonationRisk: []
    };


    const headerBodySplit = emlContent.split("\n\n");
    if (headerBodySplit.length > 1) {
        artifacts.emailBody = headerBodySplit.slice(1).join("\n\n");
    }

    const headers = headerBodySplit[0].split("\n");
    headers.forEach(line => {
        if (line.startsWith("From: ")) {
            const fromParts = line.replace("From: ", "").trim().match(/^(.*) <(.*)>$/);
            artifacts.emailMetadata.senderName = fromParts ? fromParts[1] : "Unknown";
            artifacts.emailMetadata.senderEmail = fromParts ? fromParts[2] : line.replace("From: ", "").trim();
        }
        if (line.startsWith("To: ")) artifacts.emailMetadata.to = line.replace("To: ", "").trim();
        if (line.startsWith("Subject: ")) artifacts.emailMetadata.subject = line.replace("Subject: ", "").trim();
        if (line.startsWith("Date: ")) artifacts.emailMetadata.date = line.replace("Date: ", "").trim();
        if (line.startsWith("Message-ID: ")) artifacts.messageId = line.replace("Message-ID: ", "").trim();
        if (line.startsWith("Return-Path: ")) artifacts.emailMetadata.returnPath = line.replace("Return-Path: ", "").trim();
        if (line.startsWith("Received: ")) {
            artifacts.receivedHeaders.push(line.replace("Received: ", "").trim());
            if (!artifacts.senderIP) {
                const receivedIPRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;
                const match = line.match(receivedIPRegex);
                if (match) artifacts.senderIP = match[0]; // Store only the first detected sender IP
            }
        }
            });
    // Extract URLs from email body (raw text)
    const urlRegex = /\bhttps?:\/\/[^\s<>"']+/gi;
    let extractedUrls = [...artifacts.emailBody.matchAll(urlRegex)].map(match => match[0]);

    // Extract URLs from href attributes inside HTML emails
    const hrefRegex = /href=["'](https?:\/\/[^"'>]+)["']/gi;
    extractedUrls = extractedUrls.concat([...artifacts.emailBody.matchAll(hrefRegex)].map(match => match[1]));

    // Remove unnecessary/false-positive links
    artifacts.urls = extractedUrls.filter(url => 
        !url.includes("unsubscribe") && 
        !url.includes("webmail") &&
        !url.includes("mail.google.com") &&
        !url.includes("outlook.office.com") &&
        !url.includes("example.com") // more false-positive domains to be added
    );

    return artifacts;
}

function analyzeSecurityHeaders(content) {
    console.log("Analyzing security headers...");
    const analysis = { warnings: [] };

    // Convert headers to lowercase for case-insensitive search
    const headers = content.split("\n\n")[0].toLowerCase();

    // Extract SPF, DKIM, DMARC results
    const spfMatch = headers.match(/spf=(pass|fail|neutral|softfail|permerror|temperror)/);
    const dkimMatch = headers.match(/dkim=(pass|fail|neutral|permerror|temperror)/);
    const dmarcMatch = headers.match(/dmarc=(pass|fail|none|permerror|temperror)/);

    const spfResult = spfMatch ? spfMatch[1] : "missing";
    const dkimResult = dkimMatch ? dkimMatch[1] : "missing";
    const dmarcResult = dmarcMatch ? dmarcMatch[1] : "missing";

    // 🛑 SPF Status Logic
    if (spfResult === "fail" || spfResult === "missing") {
        analysis.warnings.push("SPF validation failed or missing (email spoofing risk).");
    } else if (spfResult === "neutral" || spfResult === "softfail") {
        analysis.warnings.push("SPF is not fully enforced (neutral/softfail).");
    }

    // 🔐 DKIM Status Logic
    if (dkimResult === "fail" || dkimResult === "missing") {
        analysis.warnings.push("DKIM signature is invalid or missing.");
    }

    // 📜 DMARC Status Logic
    if (dmarcResult === "fail" || dmarcResult === "missing") {
        analysis.warnings.push("DMARC policy check failed (risk of spoofing).");
    } else if (dmarcResult === "none") {
        analysis.warnings.push("DMARC is not enforced (policy is set to 'none').");
    }

    return analysis;
}


function generateThreatSummary(artifacts) {
    let riskLevel = "Low"; // Default risk level
    let verdict = "This email appears safe, no immediate threats detected.";
    let reasoning = [];

    // 🚨 Check for Phishing Risks
    if (artifacts.phishingRisk.length > 0) {
        riskLevel = "High";
        verdict = "This email is highly suspicious and may be a phishing attempt.";
        reasoning.push("Phishing-like content detected in email body.");
    }

    // 🛑 Check for Impersonation
    if (artifacts.impersonationRisk.length > 0) {
        riskLevel = "Medium";
        verdict = "The email contains signs of sender impersonation.";
        reasoning.push("Sender’s return-path differs from email domain (potential spoofing).");
    }

    // 🛡️ Check Security Headers from pre-analyzed data
    if (artifacts.securityHeaders.risks) {
        artifacts.securityHeaders.risks.forEach(risk => reasoning.push(risk));
    }

    // 📊 Final threat assessment
    if (artifacts.threatScore > 70) riskLevel = "High";
    else if (artifacts.threatScore > 40) riskLevel = "Medium";

    return {
        riskLevel,
        verdict,
        reasoning: reasoning.join(" ")
    };

    function analyzeSecurityHeaders(content) {
        console.log("Analyzing security headers...");
        const analysis = { risks: [], info: [] }; // Separate risks & info
    
        // Convert headers to lowercase for case-insensitive search
        const headers = content.split("\n\n")[0].toLowerCase();
    }
        // Extract SPF, DKIM, DMARC results
        const spfMatch = headers.match(/spf=(pass|fail|neutral|softfail|permerror|temperror)/);
        const dkimMatch = headers.match(/dkim=(pass|fail|neutral|permerror|temperror)/);
        const dmarcMatch = headers.match(/dmarc=(pass|fail|none|permerror|temperror)/);
    
        const spfResult = spfMatch ? spfMatch[1] : "missing";
        const dkimResult = dkimMatch ? dkimMatch[1] : "missing";
        const dmarcResult = dmarcMatch ? dmarcMatch[1] : "missing";
    
        // 🛑 SPF Status Logic
        if (spfResult === "fail" || spfResult === "missing") {
            analysis.risks.push("SPF validation failed or missing. This allows email spoofing.");
        } else if (spfResult === "neutral" || spfResult === "softfail") {
            analysis.info.push("SPF is set to 'neutral/softfail'. This is not a full failure but reduces email authentication effectiveness.");
        }
    
        // 🔐 DKIM Status Logic
        if (dkimResult === "fail" || dkimResult === "missing") {
            analysis.risks.push("DKIM signature is invalid or missing. This weakens email integrity.");
        }
    
        // 📜 DMARC Status Logic
        if (dmarcResult === "fail" || dmarcResult === "missing") {
            analysis.risks.push("DMARC policy check failed or missing. This increases the risk of email spoofing.");
        } else if (dmarcResult === "none") {
            analysis.info.push("DMARC policy is set to 'none', meaning emails are monitored but not rejected. Consider stricter policies.");
        }
    
        return analysis;
    }

function displayResults(artifacts) {
    const resultsDiv = document.getElementById("results");
    let resultsHTML = `<h2>📊 Analysis Results</h2>`;

    // Threat Score
    resultsHTML += `<div class="result-section">
        <div class="result-item">
            <p><b>👀 Threat Score:</b> ${artifacts.threatScore}/100</p>
        </div>
    </div>`;

    // Email Metadata
    resultsHTML += `<div class="result-section">
        <h3>📌 Email Artifacts</h3>
        <div class="result-item">
            <p><b>Sender Name:</b> ${artifacts.emailMetadata.senderName || "N/A"}</p>
            <p><b>Sender Email:</b> ${artifacts.emailMetadata.senderEmail || "N/A"}</p>
            <p><b>To:</b> ${artifacts.emailMetadata.to || "N/A"}</p>
            <p><b>Return-Path:</b> ${artifacts.emailMetadata.returnPath || "N/A"}</p>
            <p><b>Subject:</b> ${artifacts.emailMetadata.subject || "N/A"}</p>
            <p><b>Date:</b> ${artifacts.emailMetadata.date || "N/A"}</p>
            <p><b>IP Address:</b> ${artifacts.senderIP || "N/A"}</p>
        </div>
    </div>`;

// Security Risks & Informational Warnings
if (artifacts.securityHeaders && artifacts.securityHeaders.risks && artifacts.securityHeaders.info) {
    resultsHTML += `<div class="result-section">
        <h3>⚠️ Security Analysis</h3>
        <div class="result-item">
            <ul>
                ${artifacts.securityHeaders.risks.map(issue => `<li>🚨 <b>Risk:</b> ${issue}</li>`).join('')}
                ${artifacts.securityHeaders.info.map(issue => `<li>ℹ️ <b>Info:</b> ${issue}</li>`).join('')}
            </ul>
        </div>
    </div>`;
}


// URLs Found
if (artifacts.urls.length > 0) {
    resultsHTML += `<div class="result-section">
        <h3>🔗 URLs Found</h3>
        <div class="result-item">
            <ul>
                ${artifacts.urls.map(url => `
                    <li>
                        <a href="${url}" target="_blank">${url}</a>
                        <div class="external-links">
                            <a href="https://www.virustotal.com/gui/search/${encodeURIComponent(url)}" target="_blank">VirusTotal</a>
                            <a href="https://urlscan.io/search/#${encodeURIComponent(url)}" target="_blank">URLScan</a>
                        </div>
                    </li>
                `).join('')}
            </ul>
        </div>
    </div>`;
}


    // IP Addresses Found
    if (artifacts.ipAddresses.length > 0) {
        resultsHTML += `<div class="result-section">
            <h3>🌐 IP Addresses Found</h3>
            <div class="result-item">
                <ul>
                    ${artifacts.ipAddresses.map(ip => `<li>${ip}</li>`).join('')}
                </ul>
            </div>
        </div>`;
    }

    // AI-Generated Threat Summary
    const aiSummary = generateThreatSummary(artifacts);
    resultsHTML += `<div class="result-section alert-${aiSummary.riskLevel.toLowerCase()}">
        <h3>🤖 AI-Generated Threat Summary</h3>
        <div class="result-item">
            <p><b>Risk Level:</b> <span class="risk-${aiSummary.riskLevel.toLowerCase()}">${aiSummary.riskLevel}</span></p>
            <p><b>Verdict:</b> ${aiSummary.verdict}</p>
            <p><b>Reasoning:</b> ${aiSummary.reasoning}</p>
        </div>
    </div>`;


    resultsDiv.innerHTML = resultsHTML;
}


document.addEventListener("DOMContentLoaded", function () {
    // Existing particles.js code...

    // Theme Toggle Fix
    const toggleButton = document.querySelector('.theme-toggle');
    toggleButton.addEventListener("click", function () {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Set initial theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
});
