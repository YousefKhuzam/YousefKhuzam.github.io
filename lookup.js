const platforms = [
    { name: "Twitter", url: "https://twitter.com/" },
    { name: "Instagram", url: "https://www.instagram.com/" },
    { name: "GitHub", url: "https://github.com/" },
    { name: "Reddit", url: "https://www.reddit.com/user/" },
    { name: "TikTok", url: "https://www.tiktok.com/@" },
    { name: "Pinterest", url: "https://www.pinterest.com/" },
    { name: "LinkedIn", url: "https://www.linkedin.com/in/" }
];

function lookupUsername() {
    let username = document.getElementById("usernameInput").value.trim();
    let resultsDiv = document.getElementById("results");

    if (username === "") {
        resultsDiv.innerHTML = "<p style='color: red;'>⚠️ Please enter a username.</p>";
        return;
    }

    resultsDiv.innerHTML = "<p>🔍 Checking username availability...</p>";

    setTimeout(() => {
        resultsDiv.innerHTML = "";
        platforms.forEach(platform => {
            let profileUrl = platform.url + username;
            resultsDiv.innerHTML += `
                <div class="result-item">
                    <strong>${platform.name}:</strong> 
                    <a href="${profileUrl}" target="_blank">${profileUrl}</a>
                </div>
            `;
        });
    }, 1000); // Simulated delay for better UX
}

// Allow pressing "Enter" to search
function handleKeyPress(event) {
    if (event.key === "Enter") {
        lookupUsername();
    }
}
