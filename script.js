// Dark Mode Toggle
const toggleButton = document.querySelector('.theme-toggle');
toggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

// Remember Dark Mode Preference
if (localStorage.getItem('darkMode') === "true") {
    document.body.classList.add('dark-mode');
}

// Fake Threat Intelligence Feed (Can be replaced with real API)
const threatFeed = document.getElementById('threat-feed');
const threats = [
    "🛑 New phishing attack detected in UAE targeting banking users.",
    "⚠️ Ransomware campaign spreading through email attachments in KSA.",
    "🚨 Fake HR job offers circulating on LinkedIn targeting GCC professionals."
];

function updateThreatFeed() {
    let randomThreat = threats[Math.floor(Math.random() * threats.length)];
    threatFeed.innerHTML = `<p>${randomThreat}</p>`;
}

setInterval(updateThreatFeed, 5000);
updateThreatFeed();
