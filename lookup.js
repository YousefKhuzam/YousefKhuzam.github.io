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
    const links = document.querySelectorAll("#results a");
    let linksText = "";

    links.forEach(link => {
        linksText += link.href + "\n";
    });

    if (linksText) {
        navigator.clipboard.writeText(linksText).then(() => {
            alert("📋 All profile links copied to clipboard!");
        }).catch(() => {
            alert("❌ Failed to copy links. Try again.");
        });
    }
}

const platformIcons = {
    "Facebook": "fab fa-facebook",
    "Telegram": "fab fa-telegram",
    "Snapchat": "fab fa-snapchat",
    "YouTube": "fab fa-youtube",
    "Twitter": "fab fa-twitter",
    "Instagram": "fab fa-instagram",
    "Reddit": "fab fa-reddit",
    "LinkedIn": "fab fa-linkedin",
    "Pinterest": "fab fa-pinterest",
    "TikTok": "fab fa-tiktok",
    "GitHub": "fab fa-github"
};


function validateUsername(username) {
    const regex = /^[a-zA-Z0-9_.-]{3,30}$/; // Allow letters, numbers, "_", ".", "-" (3 to 30 chars)
    return regex.test(username);
}

function lookupUsername() {
    const username = document.getElementById("usernameInput").value.trim();
    
    if (!username) {
        alert("⚠️ Please enter a username!");
        return;
    }

    if (!validateUsername(username)) {
        alert("⚠️ Invalid username format! Use only letters, numbers, '_', '.' or '-'.");
        return;
    }

    generateResults(username);
}

async function generateResults(username) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<p>⌛ Searching for username...</p>";

    let resultsHTML = "<h2>Results:</h2>";
    let linksArray = [];

    for (const platform of platforms) {
        const profileURL = `${platform.url}${username}`;
        const iconClass = platform.icon || "fas fa-globe";
        const platformClass = platform.name.toLowerCase();

        resultsHTML += `
            <p class="platform ${platformClass}">
                <i class="${iconClass}"></i>
                <b>${platform.name}</b>: 
                <a href="${profileURL}" target="_blank" class="${platformClass}">${profileURL}</a>
            </p>
        `;
        linksArray.push(profileURL);

        // 🕒 Add random delay (1.5 to 3 seconds) between requests
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1500 + 1500));
    }

    resultsDiv.innerHTML = resultsHTML;

    // Show Copy Button if results are found
    if (linksArray.length > 0) {
        document.getElementById("copyButton").style.display = "block";
    }
}
