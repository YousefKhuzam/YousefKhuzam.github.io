const platforms = [
    { name: "Facebook", url: "https://www.facebook.com/", icon: "fab fa-facebook" },
    { name: "Telegram", url: "https://t.me/", icon: "fab fa-telegram" },
    { name: "Snapchat", url: "https://www.snapchat.com/add/", icon: "fab fa-snapchat" },
    { name: "YouTube", url: "https://www.youtube.com/@", icon: "fab fa-youtube" },
    { name: "Twitter", url: "https://twitter.com/", icon: "fab fa-twitter" },
    { name: "Instagram", url: "https://www.instagram.com/", icon: "fab fa-instagram" },
    { name: "Reddit", url: "https://www.reddit.com/user/", icon: "fab fa-reddit" },
    { name: "LinkedIn", url: "https://www.linkedin.com/in/", icon: "fab fa-linkedin" },
    { name: "Pinterest", url: "https://www.pinterest.com/", icon: "fab fa-pinterest" },
    { name: "TikTok", url: "https://www.tiktok.com/@", icon: "fab fa-tiktok" },
    { name: "GitHub", url: "https://github.com/", icon: "fab fa-github" }
];

// Handle Enter Key Press
function handleKeyPress(event) {
    if (event.key === "Enter") {
        lookupUsername();
    }
}

// Generate Profile Links
function lookupUsername() {
    const username = document.getElementById("usernameInput").value.trim();
    if (!username) {
        alert("Please enter a username!");
        return;
    }

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<h2>Results:</h2>";

    let resultsHTML = "";
    let linksArray = [];

    for (const platform of platforms) {
        const profileURL = `${platform.url}${username}`;
        linksArray.push(profileURL);
        resultsHTML += `
            <p>
                <i class="${platform.icon}"></i> <b>${platform.name}</b>: 
                <a href="${profileURL}" target="_blank">${profileURL}</a>
            </p>
        `;
    }

    resultsDiv.innerHTML = resultsHTML;

    // Show Copy Button if results are found
    if (linksArray.length > 0) {
        document.getElementById("copyButton").style.display = "block";
    }
}

// Copy All Links Function
function copyAllLinks() {
    const resultsDiv = document.getElementById("results");
    const links = resultsDiv.querySelectorAll("a");
    let linksText = "";

    links.forEach(link => {
        linksText += link.href + "\n";
    });

    if (linksText) {
        navigator.clipboard.writeText(linksText).then(() => {
            alert("All profile links copied to clipboard!");
        }).catch(err => {
            alert("Failed to copy links. Try again.");
        });
    }
}
