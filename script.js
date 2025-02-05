// Dark Mode Toggle (Keeping Your Theme)
const toggleButton = document.querySelector('.theme-toggle');
toggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

// Remember Dark Mode Preference
if (localStorage.getItem('darkMode') === "true") {
    document.body.classList.add('dark-mode');
}

// Fake Threat Intelligence Feed
const threatFeed = document.getElementById('threat-feed');
const threats
