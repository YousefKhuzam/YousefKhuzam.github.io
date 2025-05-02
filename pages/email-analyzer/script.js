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

// Global variables
let toxicityModel;
let sentenceEncoder;
let qnaModel;
let rules = {};

// Load rules from local file
async function loadRules() {
    try {
        const response = await fetch('rules.json');
        rules = await response.json();
        console.log('Rules loaded successfully');
    } catch (error) {
        console.error('Error loading rules:', error);
    }
}

// Initialize TensorFlow models
async function initializeModels() {
    try {
        // Only load toxicity model as others are causing CORS issues
        toxicityModel = await toxicity.load();
        console.log('ML model loaded successfully');
    } catch (error) {
        console.error('Error loading ML model:', error);
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
    await initializeModels();
}

initializeSystem();

// Switch between input tabs
function switchTab(tab) {
    const pasteTab = document.getElementById('paste-input');
    const fileTab = document.getElementById('file-input');
    const pasteBtn = document.querySelector('.tab-btn:nth-child(1)');
    const fileBtn = document.querySelector('.tab-btn:nth-child(2)');

    if (tab === 'paste') {
        pasteTab.style.display = 'block';
        fileTab.style.display = 'none';
        pasteBtn.classList.add('active');
        fileBtn.classList.remove('active');
    } else {
        pasteTab.style.display = 'none';
        fileTab.style.display = 'block';
        pasteBtn.classList.remove('active');
        fileBtn.classList.add('active');
    }
}

// Load sample email for testing
function loadSampleEmail() {
    const sampleEmail = `From: "Amazon Security" <security@amazon.com>
To: user@example.com
Subject: Your Amazon Account Has Been Locked
Date: Wed, 15 Mar 2023 10:30:00 +0000
Message-ID: <123456789@amazon.com>
X-Mailer: Amazon Mail
Content-Type: text/html; charset=UTF-8
MIME-Version: 1.0

<html>
<body>
<p>Dear Amazon Customer,</p>
<p>We have detected unusual activity on your Amazon account. For your security, we have temporarily locked your account.</p>
<p>To unlock your account, please click here: <a href="https://amazon-security-verify.com">Verify Account</a></p>
<p>If you did not request this change, please contact our support team immediately.</p>
<p>Best regards,<br>Amazon Security Team</p>
</body>
</html>`;

    document.getElementById('emailInput').value = sampleEmail;
    switchTab('paste');
}

// Parse email content
function parseEmail(content) {
    const email = {
        headers: {},
        body: '',
        attachments: [],
        security: {
            spf: false,
            dkim: false,
            dmarc: false
        }
    };

    // Split headers and body
    const parts = content.split('\n\n');
    const headers = parts[0].split('\n');
    email.body = parts.slice(1).join('\n\n');

    // Parse headers
    headers.forEach(header => {
        const [key, ...values] = header.split(':');
        if (key && values.length > 0) {
            email.headers[key.trim()] = values.join(':').trim();
        }
    });

    // Check security headers
    if (email.headers['Received-SPF']) email.security.spf = true;
    if (email.headers['DKIM-Signature']) email.security.dkim = true;
    if (email.headers['Authentication-Results']) {
        email.security.dmarc = email.headers['Authentication-Results'].includes('dmarc=pass');
    }

    return email;
}

// Analyze email content
async function analyzeEmail() {
    const loadingSpinner = document.querySelector('.loading-spinner');
    const btnText = document.querySelector('.btn-text');
    const emailInput = document.getElementById('emailInput');
    const emlFile = document.getElementById('emlFile');
    const checkHeaders = document.getElementById('checkHeaders').checked;
    const checkContent = document.getElementById('checkContent').checked;
    const checkLinks = document.getElementById('checkLinks').checked;
    const checkImpersonation = document.getElementById('checkImpersonation').checked;

    // Show loading spinner
    loadingSpinner.style.display = 'flex';
    btnText.style.display = 'none';

    try {
        let emailContent;
        if (emailInput.value) {
            emailContent = emailInput.value;
        } else if (emlFile.files.length > 0) {
            const file = emlFile.files[0];
            emailContent = await file.text();
        } else {
            throw new Error('Please provide email content or upload a file');
        }

        const email = parseEmail(emailContent);
        const analysisResults = {
            security: { score: 0, details: [] },
            content: { score: 0, details: [] },
            links: { score: 0, details: [] },
            impersonation: { score: 0, details: [] }
        };

        // Analyze security headers
        if (checkHeaders) {
            const securityScore = analyzeSecurityHeaders(email);
            analysisResults.security = securityScore;
        }

        // Analyze content
        if (checkContent) {
            const contentScore = await analyzeContent(email);
            analysisResults.content = contentScore;
        }

        // Analyze links
        if (checkLinks) {
            const linksScore = await analyzeLinks(email);
            analysisResults.links = linksScore;
        }

        // Check for impersonation
        if (checkImpersonation) {
            const impersonationScore = await checkImpersonation(email);
            analysisResults.impersonation = impersonationScore;
        }

        // Display results
        displayResults(analysisResults);

    } catch (error) {
        console.error('Error analyzing email:', error);
        alert('Error analyzing email: ' + error.message);
    } finally {
        loadingSpinner.style.display = 'none';
        btnText.style.display = 'flex';
    }
}

// Analyze security headers
function analyzeSecurityHeaders(email) {
    const score = {
        score: 0,
        details: []
    };

    // Check SPF
    if (email.security.spf) {
        score.score += 25;
        score.details.push({ label: 'SPF', value: 'Pass', status: 'safe' });
    } else {
        score.details.push({ label: 'SPF', value: 'Fail', status: 'danger' });
    }

    // Check DKIM
    if (email.security.dkim) {
        score.score += 25;
        score.details.push({ label: 'DKIM', value: 'Pass', status: 'safe' });
    } else {
        score.details.push({ label: 'DKIM', value: 'Fail', status: 'danger' });
    }

    // Check DMARC
    if (email.security.dmarc) {
        score.score += 25;
        score.details.push({ label: 'DMARC', value: 'Pass', status: 'safe' });
    } else {
        score.details.push({ label: 'DMARC', value: 'Fail', status: 'danger' });
    }

    // Check for suspicious headers
    if (email.headers['X-Mailer']?.toLowerCase().includes('phishing')) {
        score.score -= 10;
        score.details.push({ label: 'Suspicious X-Mailer', value: email.headers['X-Mailer'], status: 'danger' });
    }

    return score;
}

// Analyze email content
async function analyzeContent(email) {
    const score = {
        score: 0,
        details: []
    };

    // Check for common phishing phrases
    const phishingPhrases = rules.phishingPhrases || [];
    const foundPhrases = phishingPhrases.filter(phrase => 
        email.body.toLowerCase().includes(phrase.toLowerCase())
    );

    if (foundPhrases.length > 0) {
        score.score -= foundPhrases.length * 10;
        score.details.push({
            label: 'Phishing Phrases',
            value: foundPhrases.join(', '),
            status: 'danger'
        });
    }

    // Check for urgency indicators
    const urgencyWords = rules.urgencyWords || [];
    const foundUrgency = urgencyWords.filter(word => 
        email.body.toLowerCase().includes(word.toLowerCase())
    );

    if (foundUrgency.length > 0) {
        score.score -= foundUrgency.length * 5;
        score.details.push({
            label: 'Urgency Indicators',
            value: foundUrgency.join(', '),
            status: 'warning'
        });
    }

    // Analyze content toxicity
    if (toxicityModel) {
        try {
            const predictions = await toxicityModel.classify(email.body);
            const toxicPredictions = predictions.filter(p => p.results[0].match);
            
            if (toxicPredictions.length > 0) {
                score.score -= toxicPredictions.length * 15;
                score.details.push({
                    label: 'Toxic Content',
                    value: toxicPredictions.map(p => p.label).join(', '),
                    status: 'danger'
                });
            }
        } catch (error) {
            console.error('Error analyzing toxicity:', error);
        }
    }

    return score;
}

// Analyze links in email
async function analyzeLinks(email) {
    const score = {
        score: 0,
        details: []
    };

    // Extract links from HTML content
    const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>/g;
    const links = [];
    let match;

    while ((match = linkRegex.exec(email.body)) !== null) {
        links.push(match[1]);
    }

    if (links.length === 0) {
        score.details.push({ label: 'Links', value: 'No links found', status: 'safe' });
        return score;
    }

    // Check for suspicious domains
    const suspiciousDomains = rules.suspiciousDomains || [];
    const suspiciousLinks = links.filter(link => {
        try {
            const url = new URL(link);
            return suspiciousDomains.some(domain => url.hostname.includes(domain));
        } catch {
            return false;
        }
    });

    if (suspiciousLinks.length > 0) {
        score.score -= suspiciousLinks.length * 20;
        score.details.push({
            label: 'Suspicious Links',
            value: suspiciousLinks.join(', '),
            status: 'danger'
        });
    }

    // Check for URL shorteners
    const shorteners = rules.urlShorteners || [];
    const shortenedLinks = links.filter(link => {
        try {
            const url = new URL(link);
            return shorteners.some(shortener => url.hostname.includes(shortener));
        } catch {
            return false;
        }
    });

    if (shortenedLinks.length > 0) {
        score.score -= shortenedLinks.length * 10;
        score.details.push({
            label: 'URL Shorteners',
            value: shortenedLinks.join(', '),
            status: 'warning'
        });
    }

    return score;
}

// Check for impersonation
async function checkImpersonation(email) {
    const score = {
        score: 0,
        details: []
    };

    // Check sender domain against known brands
    const knownBrands = rules.knownBrands || [];
    const senderDomain = email.headers['From']?.split('@')[1]?.toLowerCase();

    if (senderDomain) {
        const matchingBrand = knownBrands.find(brand => 
            senderDomain.includes(brand.domain) && senderDomain !== brand.domain
        );

        if (matchingBrand) {
            score.score -= 30;
            score.details.push({
                label: 'Domain Impersonation',
                value: `Possible impersonation of ${matchingBrand.name}`,
                status: 'danger'
            });
        }
    }

    // Check for display name spoofing
    const displayName = email.headers['From']?.match(/"([^"]+)"/)?.[1];
    if (displayName) {
        const spoofedNames = rules.spoofedNames || [];
        const isSpoofed = spoofedNames.some(name => 
            displayName.toLowerCase().includes(name.toLowerCase())
        );

        if (isSpoofed) {
            score.score -= 20;
            score.details.push({
                label: 'Display Name Spoofing',
                value: displayName,
                status: 'danger'
            });
        }
    }

    return score;
}

// Display analysis results
function displayResults(results) {
    // Update overall score
    const overallScore = Math.max(0, Math.min(100, 
        (results.security.score + results.content.score + 
         results.links.score + results.impersonation.score) / 4
    ));

    document.querySelector('.score-value').textContent = `${overallScore}%`;
    document.querySelector('.score-value').className = `score-value ${getScoreClass(overallScore)}`;

    // Update individual scores
    document.querySelector('.detail-item:nth-child(1) .value').textContent = `${results.security.score}%`;
    document.querySelector('.detail-item:nth-child(2) .value').textContent = `${results.content.score}%`;
    document.querySelector('.detail-item:nth-child(3) .value').textContent = `${results.links.score}%`;
    document.querySelector('.detail-item:nth-child(4) .value').textContent = `${results.impersonation.score}%`;

    // Update detail cards
    updateDetailCard('headers-card', 'Security Headers', results.security);
    updateDetailCard('content-card', 'Content Analysis', results.content);
    updateDetailCard('links-card', 'Link Analysis', results.links);
    updateDetailCard('impersonation-card', 'Impersonation Check', results.impersonation);
}

// Update detail card content
function updateDetailCard(cardId, title, result) {
    const card = document.getElementById(cardId);
    const content = card.querySelector('.detail-content');
    
    let html = '';
    result.details.forEach(detail => {
        html += `
            <div class="detail-item ${detail.status}">
                <span class="label">${detail.label}</span>
                <span class="value">${detail.value}</span>
            </div>
        `;
    });

    content.innerHTML = html;
}

// Get score class based on value
function getScoreClass(score) {
    if (score >= 80) return 'good';
    if (score >= 50) return 'warning';
    return 'bad';
}

// Initialize particles
particlesJS.load('particles-js', 'particles-config.json', function() {
    console.log('Particles.js loaded!');
});

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
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