// Base URL for fetching rule files from GitHub
const GITHUB_USER = "YousefKhuzam";
const GITHUB_REPO = "yousefkhuzam.github.io";
const RULES_PATH = "email-analyzer/email_analysis_rules/";
const GITHUB_RAW_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/${RULES_PATH}`;

const RULE_FILES = [
    "free_email_providers.txt",
    "free_file_hosts.txt",
    "free_subdomain_hosts.txt",
    "suspicious_content.txt",
    "suspicious_subjects.txt",
    "suspicious_tlds.txt",
    "url_shorteners.txt"
];

// Object to store loaded rules
const rules = {};

// Load rules from GitHub
async function loadRules() {
    console.log("Fetching rule files...");
    const fetchPromises = RULE_FILES.map(file =>
        fetch(GITHUB_RAW_URL + file)
            .then(res => res.text())
            .then(text => {
                rules[file.replace(".txt", "")] = text.split("\n").map(line => line.trim()).filter(line => line);
                console.log(`✅ Loaded ${file}:`, rules[file.replace(".txt", "")]);
            })
            .catch(err => console.error(`Error fetching ${file}:`, err))
    );

    await Promise.all(fetchPromises);
    console.log("Rules loaded:", rules);
}

// Load TensorFlow.js models
let aiModel, useModel, bertModel;

async function loadModel() {
    try {
        console.log("Loading AI Model...");
        aiModel = await toxicity.load(0.9);
        console.log("AI Model Loaded Successfully!");
    } catch (error) {
        console.error("Error loading AI Model:", error);
    }
}

async function loadModels() {
    try {
        console.log("⏳ Loading TensorFlow Models...");
        await tf.ready();
        useModel = await use.load();
        bertModel = await qna.load();
        console.log("✅ USE & BERT Models Loaded!");
    } catch (error) {
        console.error("❌ Error loading AI models:", error);
    }
}

// Load phishing phrases
let phishingPhrases = [];

async function loadPhishingPhrases() {
    const url = `${GITHUB_RAW_URL}suspicious_content.txt`;
    try {
        const response = await fetch(url);
        const text = await response.text();
        phishingPhrases = text.split("\n").map(line => line.trim()).filter(line => line);
        console.log("✅ Phishing phrases loaded:", phishingPhrases);
    } catch (error) {
        console.error("❌ Error loading phishing phrases:", error);
    }
}

// Initialize system
async function initializeSystem() {
    await loadRules();
    await loadPhishingPhrases();
    await loadModel();
    await loadModels();
}

initializeSystem();

// Switch between text and file input
function switchInput(type) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('emlFile').style.display = type === 'file' ? 'block' : 'none';
    document.getElementById('emailInput').style.display = type === 'file' ? 'none' : 'block';
    document.querySelector(`.tab-btn[onclick*="${type}"]`).classList.add('active');
}
function processContent(emailText) {
    console.log("Processing email content...");
    const artifacts = extractArtifacts(emailText);
    artifacts.securityHeaders = analyzeSecurityHeaders(emailText);
    artifacts.impersonationRisk = analyzeImpersonation(artifacts);
    artifacts.ruleFindings = applyRuleChecks(artifacts);

    analyzeEmailWithUSE(emailText).then(phishingRisk => {
        artifacts.phishingRisk = phishingRisk;

        analyzeEmailWithBERT(emailText).then(toxicityAnalysis => {
            artifacts.toxicityAnalysis = toxicityAnalysis;
            artifacts.threatScore = calculateThreatScore(artifacts);
            displayResults(artifacts);
        });
    });
}

// Analyze email content
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

// Extract artifacts from email content
function extractArtifacts(emlContent) {
    console.log("Extracting email artifacts...");
    const artifacts = {
        emailMetadata: {},
        emailBody: "",
        ipAddresses: [],
        urls: [],
        securityHeaders: { risks: [], info: [] },
        messageId: "",
        receivedHeaders: [],
        phishingRisk: [],
        impersonationRisk: [],
        ruleFindings: []
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
                if (match) artifacts.senderIP = match[0];
            }
        }
    });

    // Extract URLs
    const urlRegex = /\bhttps?:\/\/[^\s<>"']+/gi;
    let extractedUrls = [...artifacts.emailBody.matchAll(urlRegex)].map(match => match[0]);

    const hrefRegex = /href=["'](https?:\/\/[^"'>]+)["']/gi;
    extractedUrls = extractedUrls.concat([...artifacts.emailBody.matchAll(hrefRegex)].map(match => match[1]));

    artifacts.urls = extractedUrls.filter(url =>
        !url.includes("unsubscribe") &&
        !url.includes("webmail") &&
        !url.includes("mail.google.com") &&
        !url.includes("outlook.office.com") &&
        !url.includes("example.com")
    );

    return artifacts;
}

function loadSampleEmail() {
    const sampleEmail = `From: "Security Team" <support@securebank-alerts.com>
To: victim@example.com
Subject: Urgent: Your Account Will Be Locked!
Date: Fri, 1 Mar 2025 12:34:56 +0000
Message-ID: <1234567890@example.com>
Return-Path: <alerts@securebank-alerts.com>
Received: from phishingserver.com ([192.168.1.100])
SPF: fail
DKIM: fail
DMARC: fail

Dear Customer,

🚨 **Security Alert!** Unusual activity detected on your **Secure Bank Inc.** account.

🔴 **Immediate Action Required!** Your account has been flagged for suspicious transactions.  
🔐 **To secure your account, you must verify your details immediately!**  

🚨 **Failure to verify will result in:**  
✔️ Account Suspension  
✔️ Withdrawal Restrictions  
✔️ Permanent Deactivation  

Click below to update your information:  
🔗 **[Click here to verify](http://phishingsite.secure-login.xyz)**  

📌 **Key Security Information:**  
- **Sender uses a free email provider** (\`alerts@securebank-alerts.com\`).  
- **Contains blacklisted words**: "Suspension", "Unusual Activity", "Verify Your Account".  
- **Phishing Link detected**: \`http://phishingsite.secure-login.xyz\`.  
- **Uses a free file host**: \`https://securebank-alerts.freeupload.com/account_statement.pdf\`.  
- **URL Shortener detected**: \`https://bit.ly/secure-update\`.  
- **Suspicious TLD**: \`.xyz\` (often used in scams).  
- **Possible impersonation**: Return-Path differs from sender domain.  

🔍 **For verification, visit:**  
[Secure Bank Customer Support](https://securebank.com)  

Best Regards,  
**Security Team**  
Secure Bank Inc.`;

    // Set the email input value
    document.getElementById("emailInput").value = sampleEmail;

    // Wait a bit and then analyze the email automatically
    setTimeout(() => {
        analyzeEmail();
    }, 500); // Delay to simulate user action
}


// Analyze security headers
function analyzeSecurityHeaders(content) {
    console.log("Analyzing security headers...");
    const analysis = { risks: [], info: [] };

    // Convert headers to lowercase for case-insensitive search
    const headers = content.split("\n\n")[0].toLowerCase();

    // Extract SPF, DKIM, DMARC results
    const spfMatch = headers.match(/spf=(pass|fail|neutral|softfail|permerror|temperror)/);
    const dkimMatch = headers.match(/dkim=(pass|fail|neutral|permerror|temperror)/);
    const dmarcMatch = headers.match(/dmarc=(pass|fail|none|permerror|temperror)/);

    const spfResult = spfMatch ? spfMatch[1] : "missing";
    const dkimResult = dkimMatch ? dkimMatch[1] : "missing";
    const dmarcResult = dmarcMatch ? dmarcMatch[1] : "missing";

    // SPF Status Logic
    if (spfResult === "fail" || spfResult === "missing") {
        analysis.risks.push("SPF validation failed or missing. This allows email spoofing.");
    } else if (spfResult === "neutral" || spfResult === "softfail") {
        analysis.info.push("SPF is set to 'neutral/softfail'. This is not a full failure but reduces email authentication effectiveness.");
    }

    // DKIM Status Logic
    if (dkimResult === "fail" || dkimResult === "missing") {
        analysis.risks.push("DKIM signature is invalid or missing. This weakens email integrity.");
    }

    // DMARC Status Logic
    if (dmarcResult === "fail" || dmarcResult === "missing") {
        analysis.risks.push("DMARC policy check failed or missing. This increases the risk of email spoofing.");
    } else if (dmarcResult === "none") {
        analysis.info.push("DMARC policy is set to 'none', meaning emails are monitored but not rejected. Consider stricter policies.");
    }

    return analysis;
}

// Analyze email with USE model
async function analyzeEmailWithUSE(emailText) {
    if (!useModel) {
        console.warn("❌ USE Model not loaded!");
        return { score: 0, summary: "Not enough AI data to analyze." };
    }

    if (!phishingPhrases.length) {
        console.warn("❌ No phishing phrases loaded!");
        return { score: 0, summary: "No phishing phrases available." };
    }

    const emailEmbedding = await getUSEEmbedding(emailText);
    let maxSimilarity = 0;
    let mostSimilarPhrase = "No phishing-like content detected.";

    for (const phrase of phishingPhrases) {
        const phraseEmbedding = await getUSEEmbedding(phrase);
        const similarity = cosineSimilarity(emailEmbedding, phraseEmbedding);

        if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
            mostSimilarPhrase = phrase;
        }
    }

    let summary = maxSimilarity > 0.7
        ? `🚨 High phishing risk: Similar to "${mostSimilarPhrase}".`
        : maxSimilarity > 0.4
        ? `⚠️ Moderate phishing characteristics detected.`
        : `✅ No strong signs of phishing detected.`;

    return { score: maxSimilarity * 100, summary };
}

// Compute sentence embeddings
async function getUSEEmbedding(text) {
    const embeddings = await useModel.embed([text]);
    return embeddings.arraySync()[0];
}

// Cosine similarity function
function cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (normA * normB);
}

// Analyze email with BERT model
async function analyzeEmailWithBERT(emailText) {
    if (!bertModel) {
        console.warn("❌ BERT Model not loaded!");
        return { categories: [], summary: "No AI-based threat assessment available." };
    }

    try {
        const answers = await bertModel.findAnswers("Is this email safe?", emailText);
        let flaggedCategories = answers.map(ans => ans.text);

        let summary = flaggedCategories.length > 0
            ? `🚨 Potential threats detected: ${flaggedCategories.join(", ")}`
            : "✅ No toxic content detected.";

        return { categories: flaggedCategories, summary };
    } catch (error) {
        console.error("❌ AI Model failed to analyze:", error);
        return { categories: [], summary: "AI Model error during analysis." };
    }
}

// Analyze impersonation attempts
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

// Apply rule-based checks
function applyRuleChecks(artifacts) {
    console.log("Applying rule-based analysis...");
    let findings = [];

    // Check if sender uses a free email provider
    if (artifacts.emailMetadata.senderEmail) {
        const senderDomain = artifacts.emailMetadata.senderEmail.split("@")[1].trim();
        if (rules.free_email_providers.includes(senderDomain)) {
            findings.push(`🚩 Sender uses a free email provider: ${senderDomain}`);
        }
    }

    // Check if email contains blacklisted URLs
    if (artifacts.urls.length > 0) {
        artifacts.urls.forEach(url => {
            const hostname = new URL(url).hostname;

            // Check Free File Hosts
            if (rules.free_file_hosts.some(host => hostname.includes(host))) {
                findings.push(`⚠️ URL links to a free file host: ${url}`);
            }

            // Check URL Shorteners
            if (rules.url_shorteners.some(shortener => hostname.includes(shortener))) {
                findings.push(`🚨 Shortened URL detected: ${url}`);
            }

            // Check Suspicious TLDs
            rules.suspicious_tlds.forEach(tld => {
                if (hostname.endsWith("." + tld)) {
                    findings.push(`⚠️ Suspicious TLD found in URL: ${url}`);
                }
            });
        });
    }

    // Check if email body contains suspicious words
    if (artifacts.emailBody) {
        rules.suspicious_content.forEach(phrase => {
            if (artifacts.emailBody.toLowerCase().includes(phrase.toLowerCase())) {
                findings.push(`🚨 Suspicious content found in email: "${phrase}"`);
            }
        });
    }

    // Check if subject contains suspicious words
    if (artifacts.emailMetadata.subject) {
        rules.suspicious_subjects.forEach(phrase => {
            if (artifacts.emailMetadata.subject.toLowerCase().includes(phrase.toLowerCase())) {
                findings.push(`⚠️ Suspicious subject detected: "${artifacts.emailMetadata.subject}"`);
            }
        });
    }

    console.log("✅ Rule Findings:", findings);
    return findings;
}

// Calculate threat score
function calculateThreatScore(artifacts) {
    console.log("Calculating threat score...");
    let score = 0;

    if (artifacts.securityHeaders?.risks?.length) score += 30;
    if (artifacts.phishingRisk?.score > 0) score += artifacts.phishingRisk.score;
    if (artifacts.impersonationRisk?.length) score += 20;
    if (artifacts.urls?.length) score += artifacts.urls.length * 5;
    if (artifacts.ipAddresses?.length) score += artifacts.ipAddresses.length * 3;
    if (artifacts.ruleFindings?.length) score += artifacts.ruleFindings.length * 10;

    return Math.min(score, 100);
}

async function displayResults(artifacts) {
    const resultsDiv = document.getElementById("results");
    const aiSummary = await generateThreatSummary(artifacts);

    let resultsHTML = `<h2>📊 Analysis Results</h2>`;

    // 🎯 **Threat Score**
    resultsHTML += `<div class="result-section alert-${aiSummary.riskLevel.toLowerCase()}">
        <h3>🚨 Overall Threat Score</h3>
        <div class="result-item">
            <p><b>🔍 Threat Score:</b> <span class="risk-${aiSummary.riskLevel.toLowerCase()}">${artifacts.threatScore}/100</span></p>
            <p><b>🛡️ Risk Level:</b> ${aiSummary.riskLevel}</p>
        </div>
    </div>`;

    // 🤖 **AI-Powered Threat Summary**
    resultsHTML += `<div class="result-section">
        <h3>🤖 AI-Generated Summary</h3>
        <div class="result-item">
            <p>${aiSummary.summary}</p>
        </div>
    </div>`;

    // 📌 **Email Metadata**
    resultsHTML += `<div class="result-section">
        <h3>📩 Email Details</h3>
        <div class="result-item">
            <p><b>📧 Sender:</b> ${artifacts.emailMetadata.senderName || "N/A"} (${artifacts.emailMetadata.senderEmail || "N/A"})</p>
            <p><b>📤 To:</b> ${artifacts.emailMetadata.to || "N/A"}</p>
            <p><b>📌 Subject:</b> ${artifacts.emailMetadata.subject || "N/A"}</p>
            <p><b>📆 Date:</b> ${artifacts.emailMetadata.date || "N/A"}</p>
            <p><b>📍 Return-Path:</b> ${artifacts.emailMetadata.returnPath || "N/A"}</p>
            <p><b>🌍 Sender IP:</b> ${artifacts.senderIP || "N/A"}</p>
        </div>
    </div>`;

    // 🔒 **Security Headers Analysis**
    if (artifacts.securityHeaders.risks.length > 0 || artifacts.securityHeaders.info.length > 0) {
        resultsHTML += `<div class="result-section">
            <h3>🔐 Security Header Analysis</h3>
            <div class="result-item">
                <ul>
                    ${artifacts.securityHeaders.risks.map(issue => `<li>🚨 <b>Risk:</b> ${issue}</li>`).join('')}
                    ${artifacts.securityHeaders.info.map(issue => `<li>ℹ️ <b>Info:</b> ${issue}</li>`).join('')}
                </ul>
            </div>
        </div>`;
    }

    // 🚨 **Impersonation Risks**
    if (artifacts.impersonationRisk.length > 0) {
        resultsHTML += `<div class="result-section">
            <h3>⚠️ Impersonation Risk Detected</h3>
            <div class="result-item">
                <ul>
                    ${artifacts.impersonationRisk.map(issue => `<li>🚨 ${issue}</li>`).join('')}
                </ul>
            </div>
        </div>`;
    }

    // 📜 **Rule-Based Findings**
    if (artifacts.ruleFindings.length > 0) {
        resultsHTML += `<div class="result-section">
            <h3>📜 Rule-Based Analysis</h3>
            <div class="result-item">
                <ul>
                    ${artifacts.ruleFindings.map(issue => `<li>🔍 ${issue}</li>`).join('')}
                </ul>
            </div>
        </div>`;
    }

    // 🔗 **URLs Found**
    if (artifacts.urls.length > 0) {
        resultsHTML += `<div class="result-section">
            <h3>🔗 URLs Found</h3>
            <div class="result-item">
                <ul>
                    ${artifacts.urls.map(url => `
                        <li>
                            <a href="${url}" target="_blank">${url}</a>
                            <div class="external-links">
                                <a href="https://www.virustotal.com/gui/search/${encodeURIComponent(url)}" target="_blank">🔍 VirusTotal</a>
                                <a href="https://urlscan.io/search/#${encodeURIComponent(url)}" target="_blank">🔍 URLScan</a>
                            </div>
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>`;
    }

    // 🌍 **IP Addresses Found**
    if (artifacts.ipAddresses.length > 0) {
        resultsHTML += `<div class="result-section">
            <h3>🌍 IP Addresses Found</h3>
            <div class="result-item">
                <ul>
                    ${artifacts.ipAddresses.map(ip => `<li>${ip}</li>`).join('')}
                </ul>
            </div>
        </div>`;
    }

    // 🚀 Inject into results div
    resultsDiv.innerHTML = resultsHTML;
}
async function generateThreatSummary(artifacts) {
    let riskLevel = "Low";
    let summaryParts = [];

    // 🛑 **AI-Powered Phishing Risk Analysis**
    if (artifacts.phishingRisk.score > 70) {
        riskLevel = "High";
        summaryParts.push(`🚨 <b>Phishing Risk:</b><br>- This email is highly similar to known phishing attempts.<br>- AI detected suspicious wording.`);
    } else if (artifacts.phishingRisk.score > 40) {
        riskLevel = "Medium";
        summaryParts.push(`⚠️ <b>Potential Phishing:</b><br>- Some characteristics of phishing were detected.`);
    }

    // 📝 **AI-Identified Malicious Content**
    if (artifacts.toxicityAnalysis.categories.length > 0) {
        riskLevel = "High";
        summaryParts.push(`🚨 <b>Suspicious Content:</b><br>- AI found potential scam or threatening phrases in the email.`);
    }

    // 📌 **Rule-Based Scam Indicators**
    if (artifacts.ruleFindings.length > 0) {
        summaryParts.push(`📌 <b>Red Flags Detected:</b><br>${artifacts.ruleFindings.map(issue => `- ${issue}`).join("<br>")}`);
    }

    // 🛡️ **Sender Reputation Check**
    if (rules.free_email_providers.includes(artifacts.emailMetadata.senderEmail?.split("@")[1])) {
        summaryParts.push(`⚠️ <b>Sender Alert:</b><br>- The sender is using a free email provider (${artifacts.emailMetadata.senderEmail}).<br>- This is common in scams.`);
    }

    // 🔗 **URL Analysis**
    if (artifacts.urls.length > 0) {
        summaryParts.push(`🔗 <b>Suspicious URLs Found:</b><br>- This email contains external links that may be dangerous.<br>- Check VirusTotal for further analysis.`);
    }

    // ⚠️ **Impersonation Risks**
    if (artifacts.impersonationRisk.length > 0) {
        riskLevel = "Medium";
        summaryParts.push(`⚠️ <b>Possible Impersonation:</b><br>- Return-Path does not match the sender's domain.<br>- This could be spoofing.`);
    }

    // 🔥 **Final Threat Level Decision**
    if (artifacts.threatScore > 80) {
        riskLevel = "Critical";
        summaryParts.push(`⚠️ <b>High Threat Detected! Immediate action required!</b>`);
    } else if (artifacts.threatScore > 60) {
        riskLevel = "High";
        summaryParts.push(`🚨 <b>High Risk:</b> Proceed with extreme caution.`);
    } else if (artifacts.threatScore > 40) {
        riskLevel = "Medium";
        summaryParts.push(`⚠️ <b>Moderate Risk:</b> Review before taking action.`);
    }

    return {
        riskLevel,
        summary: summaryParts.join("<br><br>") // ✅ Adds proper HTML line breaks for readability
    };
}



// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
    particlesJS.load('particles-js', '/particles-config.json', function () {
        console.log("Particles.js loaded!");
    });


    // Theme toggle
    const toggleButton = document.querySelector('.theme-toggle');
    toggleButton.addEventListener("click", function () {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
});