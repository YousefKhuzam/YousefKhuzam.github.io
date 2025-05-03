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
let freeFileHosts = [];
let freeSubdomainHosts = [];

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

// Load brands and spoofed display names
let brandsList = [];
let spoofedDisplayNames = [];
async function loadImpersonationRules() {
    try {
        const brandsResp = await fetch('brands.json');
        brandsList = await brandsResp.json();
    } catch (e) { brandsList = []; }
    try {
        const spoofedResp = await fetch('spoofed_display_names.txt');
        const text = await spoofedResp.text();
        spoofedDisplayNames = text.split('\n').map(x => x.trim()).filter(Boolean);
    } catch (e) { spoofedDisplayNames = []; }
}

// Load extra link rules
async function loadExtraLinkRules() {
    try {
        const fileHostsResp = await fetch('email_analysis_rules/free_file_hosts.txt');
        const text = await fileHostsResp.text();
        freeFileHosts = text.split('\n').map(x => x.trim()).filter(Boolean);
    } catch (e) { freeFileHosts = []; }
    try {
        const subdomainResp = await fetch('email_analysis_rules/free_subdomain_hosts.txt');
        const text = await subdomainResp.text();
        freeSubdomainHosts = text.split('\n').map(x => x.trim()).filter(Boolean);
    } catch (e) { freeSubdomainHosts = []; }
}

// Initialize system
async function initializeSystem() {
    await loadRules();
    await loadPhishingPhrases();
    await loadImpersonationRules();
    await loadExtraLinkRules();
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
        const findings = await analyzeEmailContent(email);
        displayFindings(findings, email);

    } catch (error) {
        console.error('Error analyzing email:', error);
        alert('Error analyzing email: ' + error.message);
    } finally {
        loadingSpinner.style.display = 'none';
        btnText.style.display = 'flex';
    }
}

// Helper: Levenshtein distance
function levenshtein(a, b) {
    const matrix = Array.from({ length: a.length + 1 }, () => []);
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            if (a[i - 1] === b[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + 1
                );
            }
        }
    }
    return matrix[a.length][b.length];
}

// Helper: Homoglyph map
const homoglyphs = {
    'a': ['à', 'á', 'â', 'ã', 'ä', 'å', 'ɑ', 'а'],
    'c': ['с'],
    'e': ['è', 'é', 'ê', 'ë', 'е'],
    'i': ['ì', 'í', 'î', 'ï', 'і', 'í'],
    'o': ['ò', 'ó', 'ô', 'õ', 'ö', 'о', '0'],
    'u': ['ù', 'ú', 'û', 'ü'],
    'y': ['у'],
    's': ['ѕ'],
    'l': ['ӏ', 'ⅼ', 'ӏ'],
    'd': ['ԁ'],
    'm': ['м'],
    'n': ['п'],
    'r': ['г'],
    'h': ['һ'],
    'b': ['Ь', 'в'],
    'g': ['ɡ'],
    'p': ['р'],
    't': ['т'],
    'x': ['х'],
    'z': ['ᴢ'],
    'q': ['ԛ'],
    'w': ['ѡ'],
    'f': ['ғ'],
    'k': ['κ'],
    'v': ['ѵ'],
};

function hasHomoglyph(domain, brandDomain) {
    for (let i = 0; i < domain.length; i++) {
        const char = domain[i].toLowerCase();
        if (homoglyphs[char]) {
            for (const glyph of homoglyphs[char]) {
                if (brandDomain.includes(glyph)) return true;
            }
        }
    }
    return false;
}

// Analyze email content and return findings
async function analyzeEmailContent(email) {
    const findings = [];

    // Suspicious content
    const phishingPhrases = rules.phishingPhrases || [];
    const foundPhrases = phishingPhrases.filter(phrase => 
        email.body.toLowerCase().includes(phrase.toLowerCase())
    );

    // Suspicious links, TLDs, shorteners, file hosts, subdomain hosts
    const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>/g;
    const links = [];
    let match;
    while ((match = linkRegex.exec(email.body)) !== null) {
        links.push(match[1]);
    }
    const suspiciousDomains = rules.suspiciousDomains || [];
    const suspiciousTLDs = rules.suspiciousTLDs || [];
    const urlShorteners = rules.urlShorteners || [];
    const suspiciousLinks = [];
    const tldLinks = [];
    const shortenerLinks = [];
    const fileHostLinks = [];
    const subdomainLinks = [];
    links.forEach(link => {
        try {
            const url = new URL(link);
            if (suspiciousDomains.some(domain => url.hostname.includes(domain))) {
                suspiciousLinks.push(link);
            }
            if (suspiciousTLDs.some(tld => url.hostname.endsWith('.' + tld))) {
                tldLinks.push(link);
            }
            if (urlShorteners.some(short => url.hostname.includes(short))) {
                shortenerLinks.push(link);
            }
            if (freeFileHosts.length > 0 && freeFileHosts.some(host => url.hostname.includes(host))) {
                fileHostLinks.push(link);
            }
            if (freeSubdomainHosts.length > 0 && freeSubdomainHosts.some(host => url.hostname.endsWith(host))) {
                subdomainLinks.push(link);
            }
        } catch {}
    });

    // Check security headers
    if (email.headers['Received-SPF']) {
        findings.push({
            type: 'security',
            severity: 'good',
            title: 'SPF Record Found',
            description: 'Email has SPF authentication',
            details: email.headers['Received-SPF']
        });
    } else {
        findings.push({
            type: 'security',
            severity: 'danger',
            title: 'No SPF Record',
            description: 'Email lacks SPF authentication',
            details: 'This could indicate a spoofed sender'
        });
    }

    if (email.headers['DKIM-Signature']) {
        findings.push({
            type: 'security',
            severity: 'good',
            title: 'DKIM Signature Found',
            description: 'Email has DKIM authentication',
            details: email.headers['DKIM-Signature']
        });
    } else {
        findings.push({
            type: 'security',
            severity: 'danger',
            title: 'No DKIM Signature',
            description: 'Email lacks DKIM authentication',
            details: 'This could indicate a spoofed sender'
        });
    }

    // Suspicious subject
    if (email.headers['Subject']) {
        const suspiciousSubjects = (rules.suspiciousSubjects || []);
        const foundSubjects = suspiciousSubjects.filter(subj => email.headers['Subject'].toLowerCase().includes(subj.toLowerCase()));
        if (foundSubjects.length > 0) {
            findings.push({
                type: 'content',
                severity: 'danger',
                title: 'Suspicious Subject',
                description: 'Email subject contains suspicious words',
                details: foundSubjects.join(', ')
            });
        }
    }

    // Check for suspicious content
    if (foundPhrases.length > 0) {
        findings.push({
            type: 'content',
            severity: 'high',
            title: 'Suspicious Phrases Found',
            description: 'Email contains known phishing phrases',
            details: foundPhrases.join(', ')
        });
    }

    // Check for urgency indicators
    const urgencyWords = rules.urgencyWords || [];
    const foundUrgency = urgencyWords.filter(word => 
        email.body.toLowerCase().includes(word.toLowerCase())
    );
    if (foundUrgency.length > 0) {
        findings.push({
            type: 'content',
            severity: 'warning',
            title: 'Urgency Indicators Found',
            description: 'Email contains urgency-inducing language',
            details: foundUrgency.join(', ')
        });
    }

    // Check for suspicious links, TLDs, and shorteners
    if (suspiciousLinks.length > 0) {
        findings.push({
            type: 'links',
            severity: 'danger',
            title: 'Suspicious Links Found',
            description: 'Email contains links to suspicious domains',
            details: suspiciousLinks.join(', ')
        });
    }

    // Check for links to free file hosts
    if (fileHostLinks.length > 0) {
        findings.push({
            type: 'links',
            severity: 'warning',
            title: 'Links to Free File Hosts',
            description: 'Email contains links to free file hosting services.',
            details: fileHostLinks.join(', ')
        });
    }

    // Check for links to free subdomain hosts
    if (subdomainLinks.length > 0) {
        findings.push({
            type: 'links',
            severity: 'warning',
            title: 'Links to Free Subdomain Hosts',
            description: 'Email contains links to free subdomain hosting services.',
            details: subdomainLinks.join(', ')
        });
    }

    // Use brandsList and spoofedDisplayNames
    const knownBrands = brandsList.length ? brandsList : (rules.knownBrands || []);
    const senderDomain = email.headers['From']?.split('@')[1]?.toLowerCase();
    const displayName = email.headers['From']?.match(/"([^"]+)"/)?.[1];

    // 1. Display Name Brand Spoofing (High)
    if (displayName && senderDomain) {
        for (const brand of knownBrands) {
            if (displayName.toLowerCase().includes(brand.name.toLowerCase()) && !senderDomain.endsWith(brand.domain)) {
                findings.push({
                    type: 'impersonation',
                    severity: 'high',
                    title: 'Display Name Brand Spoofing',
                    description: `Display name contains brand "${brand.name}" but sender domain is not ${brand.domain}.`,
                    details: `Display: ${displayName}, Domain: ${senderDomain}`
                });
            }
        }
        // Spoofed display name from file (Medium)
        for (const spoofed of spoofedDisplayNames) {
            if (displayName.toLowerCase().includes(spoofed.toLowerCase())) {
                findings.push({
                    type: 'impersonation',
                    severity: 'medium',
                    title: 'Spoofed Display Name',
                    description: `Display name matches a known spoofed name: ${spoofed}`,
                    details: `Display: ${displayName}`
                });
            }
        }
    }

    // 2. From Domain Typosquatting (High)
    if (senderDomain) {
        for (const brand of knownBrands) {
            const dist = levenshtein(senderDomain, brand.domain);
            if (dist > 0 && dist <= 2 && !senderDomain.endsWith(brand.domain)) {
                findings.push({
                    type: 'impersonation',
                    severity: 'high',
                    title: 'From Domain Typosquatting',
                    description: `Sender domain is a close misspelling of brand domain (${brand.domain}).`,
                    details: `Sender: ${senderDomain}, Brand: ${brand.domain}`
                });
            }
        }
    }

    // 3. Homoglyph Domain Attack (High)
    if (senderDomain) {
        for (const brand of knownBrands) {
            if (hasHomoglyph(senderDomain, brand.domain) && !senderDomain.endsWith(brand.domain)) {
                findings.push({
                    type: 'impersonation',
                    severity: 'high',
                    title: 'Homoglyph Domain Attack',
                    description: `Sender domain uses visually similar characters to mimic brand domain (${brand.domain}).`,
                    details: `Sender: ${senderDomain}, Brand: ${brand.domain}`
                });
            }
        }
    }

    // 4. Phishing Phrases (High)
    if (foundPhrases.length > 0) {
        findings.push({
            type: 'content',
            severity: 'high',
            title: 'Suspicious Phrases Found',
            description: 'Email contains known phishing phrases',
            details: foundPhrases.join(', ')
        });
    }

    // 5. Suspicious Links (High)
    if (suspiciousLinks.length > 0) {
        findings.push({
            type: 'links',
            severity: 'high',
            title: 'Suspicious Links Found',
            description: 'Email contains links to suspicious domains',
            details: suspiciousLinks.join(', ')
        });
    }

    // 6. Suspicious TLDs (Medium)
    if (tldLinks.length > 0) {
        findings.push({
            type: 'links',
            severity: 'medium',
            title: 'Suspicious TLDs Found',
            description: 'Email contains links with suspicious top-level domains',
            details: tldLinks.join(', ')
        });
    }

    // 7. URL Shorteners (Medium)
    if (shortenerLinks.length > 0) {
        findings.push({
            type: 'links',
            severity: 'medium',
            title: 'URL Shorteners Found',
            description: 'Email contains links using URL shorteners',
            details: shortenerLinks.join(', ')
        });
    }

    // 8. Reply-To Mismatch (Medium)
    if (email.headers['Reply-To'] && email.headers['From']) {
        const replyTo = email.headers['Reply-To'].toLowerCase();
        const from = email.headers['From'].toLowerCase();
        if (replyTo !== from && !replyTo.includes(from.split('@')[1])) {
            findings.push({
                type: 'headers',
                severity: 'medium',
                title: 'Reply-To Mismatch',
                description: 'Reply-To address is different from From address, which is a common phishing tactic.',
                details: `From: ${email.headers['From']} | Reply-To: ${email.headers['Reply-To']}`
            });
        }
    }

    // 9. Suspicious Return-Path (Medium)
    if (email.headers['Return-Path'] && email.headers['From']) {
        const returnPath = email.headers['Return-Path'].toLowerCase();
        const from = email.headers['From'].toLowerCase();
        if (returnPath !== from && /@(gmail|yahoo|hotmail|outlook|aol)\./.test(returnPath)) {
            findings.push({
                type: 'headers',
                severity: 'medium',
                title: 'Suspicious Return-Path',
                description: 'Return-Path is different from From and uses a free email provider.',
                details: `From: ${email.headers['From']} | Return-Path: ${email.headers['Return-Path']}`
            });
        }
    }

    // 10. Excessive External Links (Medium)
    if (links.length > 5) {
        findings.push({
            type: 'links',
            severity: 'medium',
            title: 'Excessive External Links',
            description: 'Email contains an unusually high number of external links.',
            details: `Number of links: ${links.length}`
        });
    }

    // 11. Generic Greeting (Medium)
    if (email.body) {
        const genericGreetings = [/dear customer/i, /dear user/i, /dear client/i, /hello/i, /hi there/i];
        const hasGreeting = genericGreetings.some(rgx => rgx.test(email.body));
        if (!hasGreeting) {
            findings.push({
                type: 'content',
                severity: 'medium',
                title: 'No or Generic Greeting',
                description: 'Email does not address the recipient by name or uses a generic greeting.',
                details: 'No personalized greeting found.'
            });
        }
    }

    // 12. Suspicious Language Patterns (Medium)
    if (email.body) {
        const poorGrammar = /\b(?:your|youre|u|pls|plz|thx|ur)\b/i;
        const excessiveExclam = /!{3,}/;
        const allCaps = /\b[A-Z]{4,}\b/;
        if (poorGrammar.test(email.body) || excessiveExclam.test(email.body) || allCaps.test(email.body)) {
            findings.push({
                type: 'content',
                severity: 'medium',
                title: 'Suspicious Language Patterns',
                description: 'Email contains poor grammar, excessive exclamation marks, or all-caps words.',
                details: 'Suspicious language detected.'
            });
        }
    }

    // 13. No Unsubscribe Link (Low)
    if (email.body && /unsubscribe/i.test(email.body) === false && /marketing|newsletter|promotion/i.test(email.body)) {
        findings.push({
            type: 'content',
            severity: 'low',
            title: 'No Unsubscribe Link',
            description: 'Marketing-like email lacks an unsubscribe link.',
            details: 'No "unsubscribe" found in body.'
        });
    }

    // 14. No Contact Information (Low)
    if (email.body && !/(\+\d{1,3}[\s-]?)?(\(\d{1,4}\)[\s-]?)?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,9}/.test(email.body) && !/@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(email.body)) {
        findings.push({
            type: 'content',
            severity: 'low',
            title: 'No Contact Information',
            description: 'Email does not provide any legitimate contact information.',
            details: 'No phone, address, or email found.'
        });
    }

    // 15. No Plaintext Body (Low)
    if (email.headers['Content-Type'] && email.headers['Content-Type'].includes('text/html') && !email.headers['Content-Type'].includes('text/plain')) {
        findings.push({
            type: 'content',
            severity: 'low',
            title: 'No Plaintext Body',
            description: 'Email only contains HTML and no plaintext version, which is suspicious.',
            details: email.headers['Content-Type']
        });
    }

    // 16. Sent at Odd Hour (Low)
    if (email.headers['Date']) {
        const date = new Date(email.headers['Date']);
        const hour = date.getUTCHours();
        if (hour >= 2 && hour <= 5) {
            findings.push({
                type: 'headers',
                severity: 'low',
                title: 'Suspicious Time of Sending',
                description: 'Email was sent at an unusual hour (2am–5am UTC).',
                details: email.headers['Date']
            });
        }
    }

    // 17. Free Email Provider (Low)
    const freeProviders = rules.freeEmailProviders || [];
    if (senderDomain && freeProviders.some(provider => senderDomain.endsWith(provider))) {
        findings.push({
            type: 'impersonation',
            severity: 'low',
            title: 'Free Email Provider',
            description: 'Sender uses a free email provider',
            details: senderDomain
        });
    }

    // 18. Image-Only Email (Informational)
    if (email.body && /<img\s/i.test(email.body) && email.body.replace(/<img[\s\S]*?>/gi, '').trim().length < 30) {
        findings.push({
            type: 'content',
            severity: 'info',
            title: 'Image-Only Email',
            description: 'Email body is mostly or entirely an image.',
            details: 'Body contains only images.'
        });
    }

    // 19. Short URL in Display Text (Informational)
    if (email.body) {
        const shortUrlDisplay = /<a[^>]*>(https?:\/\/(bit\.ly|tinyurl\.com|goo\.gl|t\.co|ow\.ly|is\.gd|buff\.ly|adf\.ly|shorte\.st|bc\.vc|adfoc\.us)[^<]*)<\/a>/i;
        if (shortUrlDisplay.test(email.body)) {
            findings.push({
                type: 'links',
                severity: 'info',
                title: 'Short URL in Display Text',
                description: 'A link display text is a short URL.',
                details: 'Short URL found in link text.'
            });
        }
    }

    return findings;
}

// Calculate overall risk level
function calculateRiskLevel(findings) {
    if (findings.some(f => f.severity === 'high')) return 'high';
    if (findings.some(f => f.severity === 'medium')) return 'medium';
    if (findings.some(f => f.severity === 'low')) return 'low';
    return 'info';
}

// Calculate risk score
function calculateRiskScore(findings) {
    let score = 0;
    findings.forEach(f => {
        if (f.severity === 'high') score += 40;
        else if (f.severity === 'medium') score += 20;
        else if (f.severity === 'low') score += 10;
        // info does not add to risk
    });
    return Math.min(100, score);
}

function extractArtifacts(email) {
    // Extract sender name and email
    let senderName = '';
    let senderEmail = '';
    if (email.headers['From']) {
        const match = email.headers['From'].match(/"?([^"<]*)"?\s*<([^>]+)>/);
        if (match) {
            senderName = match[1].trim();
            senderEmail = match[2].trim();
        } else {
            senderEmail = email.headers['From'].trim();
        }
    }
    // Recipients
    let recipients = email.headers['To'] || '';
    // Sender IP (from Received header)
    let senderIP = '';
    if (email.headers['Received']) {
        const ipMatch = email.headers['Received'].match(/\[([0-9a-fA-F\.:]+)\]/);
        if (ipMatch) senderIP = ipMatch[1];
    }
    // Date
    let date = email.headers['Date'] || '';
    // Subject
    let subject = email.headers['Subject'] || '';
    // Message-ID
    let messageId = email.headers['Message-ID'] || '';
    // Reply-To
    let replyTo = email.headers['Reply-To'] || '';
    // Return-Path
    let returnPath = email.headers['Return-Path'] || '';
    return {
        senderName,
        senderEmail,
        recipients,
        senderIP,
        date,
        subject,
        messageId,
        replyTo,
        returnPath
    };
}

// Display findings
function displayFindings(findings, email) {
    const resultsSection = document.getElementById('results');
    const findingsContainer = document.createElement('div');
    findingsContainer.className = 'findings-container';

    // Calculate overall risk level
    const riskLevel = calculateRiskLevel(findings);
    const riskScore = calculateRiskScore(findings);

    // Extract artifacts
    const artifacts = extractArtifacts(email);

    // Create artifacts overview
    const artifactsOverview = document.createElement('div');
    artifactsOverview.className = 'artifacts-overview';
    artifactsOverview.innerHTML = `
      <div class="artifacts-table">
        <div><strong>Sender Name:</strong> ${artifacts.senderName || '-'}</div>
        <div><strong>Sender Email:</strong> ${artifacts.senderEmail || '-'}</div>
        <div><strong>Recipient(s):</strong> ${artifacts.recipients || '-'}</div>
        <div><strong>Sender IP:</strong> ${artifacts.senderIP || '-'}</div>
        <div><strong>Date:</strong> ${artifacts.date || '-'}</div>
        <div><strong>Subject:</strong> ${artifacts.subject || '-'}</div>
        <div><strong>Message-ID:</strong> ${artifacts.messageId || '-'}</div>
        <div><strong>Reply-To:</strong> ${artifacts.replyTo || '-'}</div>
        <div><strong>Return-Path:</strong> ${artifacts.returnPath || '-'}</div>
      </div>
      <div class="risk-score-box risk-level-${riskLevel}">
        <div class="risk-score-main">${riskScore}%</div>
        <div class="risk-label">${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk</div>
      </div>
    `;
    findingsContainer.appendChild(artifactsOverview);

    // Group findings by type
    const groupedFindings = groupFindingsByType(findings);

    // Create findings cards
    Object.entries(groupedFindings).forEach(([type, typeFindings]) => {
        const typeCard = document.createElement('div');
        typeCard.className = 'findings-card';
        typeCard.innerHTML = `
            <h3><i class="fas fa-${getIconForType(type)}"></i> ${type.charAt(0).toUpperCase() + type.slice(1)}</h3>
            <div class="findings-list">
                ${typeFindings.map(finding => `
                    <div class="finding-item ${finding.severity}">
                        <div class="finding-header">
                            <span class="severity-indicator"></span>
                            <span class="finding-title">${finding.title}</span>
                        </div>
                        <div class="finding-description">${finding.description}</div>
                        <div class="finding-details">${finding.details}</div>
                    </div>
                `).join('')}
            </div>
        `;
        findingsContainer.appendChild(typeCard);
    });

    // Clear previous results and add new ones
    resultsSection.innerHTML = '';
    resultsSection.appendChild(findingsContainer);
}

// Group findings by type
function groupFindingsByType(findings) {
    return findings.reduce((groups, finding) => {
        if (!groups[finding.type]) {
            groups[finding.type] = [];
        }
        groups[finding.type].push(finding);
        return groups;
    }, {});
}

// Get icon for finding type
function getIconForType(type) {
    const icons = {
        security: 'shield-alt',
        content: 'file-alt',
        links: 'link',
        impersonation: 'user-shield'
    };
    return icons[type] || 'info-circle';
}

// Initialize particles
particlesJS.load('particles-js', 'particles-config.json', function() {
    console.log('Particles.js loaded!');
});

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
    // Theme toggle
    const toggleButton = document.querySelector('.theme-toggle');
    const themeIcon = toggleButton ? toggleButton.querySelector('i') : null;
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }
    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    if (toggleButton) {
        toggleButton.addEventListener("click", function () {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            setTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }

    // File upload feedback
    const emlFileInput = document.getElementById('emlFile');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    if (emlFileInput && fileNameDisplay) {
        emlFileInput.addEventListener('change', function() {
            if (emlFileInput.files.length > 0) {
                fileNameDisplay.textContent = `Selected: ${emlFileInput.files[0].name}`;
            } else {
                fileNameDisplay.textContent = '';
            }
        });
    }
});