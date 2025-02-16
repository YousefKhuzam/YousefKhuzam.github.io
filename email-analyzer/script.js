document.addEventListener("DOMContentLoaded", function () {
    particlesJS.load('particles-js', '/particles-config.json', function () {
        console.log("Particles.js loaded!");
    });
});

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

    if (!textInput && !fileInput) {
        alert('Please paste email content or upload an .eml file!');
        return;
    }

    const processContent = content => {
        const artifacts = extractArtifacts(content);
        artifacts.securityHeaders = analyzeSecurityHeaders(content);
        artifacts.threatScore = calculateThreatScore(artifacts);
        displayResults(artifacts);
    };

    if (fileInput) {
        const reader = new FileReader();
        reader.onload = e => processContent(e.target.result);
        reader.readAsText(fileInput);
    } else {
        processContent(textInput);
    }
}

function extractArtifacts(emlContent) {
    const artifacts = {
        emailMetadata: {},
        emailBody: "",
        ipAddresses: [],
        urls: [],
        securityHeaders: {},
        messageId: ""
    };

    const headerBodySplit = emlContent.split("\n\n");
    const headers = headerBodySplit[0].split("\n");
    artifacts.emailBody = headerBodySplit.slice(1).join("\n\n");

    headers.forEach(line => {
        if (line.startsWith("From: ")) artifacts.emailMetadata.from = line.replace("From: ", "").trim();
        if (line.startsWith("To: ")) artifacts.emailMetadata.to = line.replace("To: ", "").trim();
        if (line.startsWith("Subject: ")) artifacts.emailMetadata.subject = line.replace("Subject: ", "").trim();
        if (line.startsWith("Date: ")) artifacts.emailMetadata.date = line.replace("Date: ", "").trim();
        if (line.startsWith("Message-ID: ")) artifacts.messageId = line.replace("Message-ID: ", "").trim();
    });

    const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
    artifacts.ipAddresses = [...emlContent.matchAll(ipRegex)].map(match => match[0]);

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    artifacts.urls = [...emlContent.matchAll(urlRegex)].map(match => match[0]);

    return artifacts;
}

function analyzeSecurityHeaders(content) {
    const analysis = { warnings: [] };
    const headers = content.split("\n\n")[0].toLowerCase();
    
    if (!headers.includes('spf=pass')) analysis.warnings.push('SPF validation missing or failed');
    if (!headers.includes('dkim=pass')) analysis.warnings.push('DKIM signature missing or invalid');
    if (!headers.includes('dmarc=pass')) analysis.warnings.push('DMARC policy check failed');
    
    return analysis;
}

function calculateThreatScore(artifacts) {
    let score = 0;
    if (artifacts.securityHeaders.warnings.length) score += 30;
    if (artifacts.urls.length) score += artifacts.urls.length * 5;
    if (artifacts.ipAddresses.length) score += artifacts.ipAddresses.length * 3;
    return Math.min(score, 100);
}

function displayResults(artifacts) {
    const resultsDiv = document.getElementById("results");
    let resultsHTML = `<h2>📊 Analysis Results</h2>`;

    resultsHTML += `<div class="result-section">
        <h3>📌 Email Metadata</h3>
        <div class="result-item">
            <p><b>From:</b> ${artifacts.emailMetadata.from || "N/A"}</p>
            <p><b>To:</b> ${artifacts.emailMetadata.to || "N/A"}</p>
            <p><b>Subject:</b> ${artifacts.emailMetadata.subject || "N/A"}</p>
            <p><b>Date:</b> ${artifacts.emailMetadata.date || "N/A"}</p>
        </div>
    </div>`;

    if (artifacts.ipAddresses.length > 0) {
        resultsHTML += `<div class="result-section">
            <h3>🌐 IP Addresses Found</h3>
            <div class="result-item">
                <ul>${artifacts.ipAddresses.map(ip => `
                    <li>${ip} - <div class="external-links">
                        <a href="https://www.abuseipdb.com/check/${ip}" target="_blank">AbuseIPDB</a>
                        <a href="https://www.virustotal.com/gui/ip-address/${ip}" target="_blank">VirusTotal</a>
                        <a href="https://mxtoolbox.com/SuperTool.aspx?action=arin%3a${ip}&run=toolpage" target="_blank">MXToolbox</a>
                    </div></li>`).join('')}
                </ul>
            </div>
        </div>`;
    }

    if (artifacts.urls.length > 0) {
        resultsHTML += `<div class="result-section">
            <h3>🔗 URLs Found</h3>
            <div class="result-item">
                <ul>${artifacts.urls.map(url => `
                    <li><a href="${url}" target="_blank">${url}</a> - <div class="external-links">
                        <a href="https://www.virustotal.com/gui/search/${encodeURIComponent(url)}" target="_blank">VirusTotal</a>
                        <a href="https://urlscan.io/search/#${encodeURIComponent(url)}" target="_blank">URLScan</a>
                    </div></li>`).join('')}
                </ul>
            </div>
        </div>`;
    }

    resultsHTML += `<div class="result-section">
        <h3>📜 Email Content (Preview)</h3>
        <div class="result-item">
            <textarea readonly style="width:100%; height:150px;">${artifacts.emailBody.slice(0, 500)}...</textarea>
        </div>
    </div>`;

    resultsDiv.innerHTML = resultsHTML;
}