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

function handleKeyPress(event) {
    if (event.key === "Enter") {
        lookupUsername();
    }
}

function lookupUsername() {
    const username = document.getElementById("usernameInput").value.trim();
    if (!username) {
        alert("Please enter a username!");
        return;
    }

    const resultsDiv = document.getElementById("results");
    const copyButton = document.getElementById("copyButton");

    let resultsHTML = "<h2>Generated Profile Links:</h2>";
    let foundLinks = [];

    for (const platform of platforms) {
        const profileURL = `${platform.url}${username}`;
        resultsHTML += `
            <p>
                <i class="${platform.icon}"></i>
                <b>${platform.name}</b>: 
                <a href="${profileURL}" target="_blank">${profileURL}</a>
            </p>
        `;
        foundLinks.push(profileURL);
    }

    resultsDiv.innerHTML = resultsHTML;

    if (foundLinks.length > 0) {
        copyButton.style.display = "block";
        copyButton.dataset.links = foundLinks.join("\n");
    } else {
        copyButton.style.display = "none";
    }
}

function copyAllLinks() {
    const copyButton = document.getElementById("copyButton");
    const linksText = copyButton.dataset.links;

    if (!linksText) {
        alert("No links to copy!");
        return;
    }

    navigator.clipboard.writeText(linksText).then(() => {
        alert("All links copied to clipboard!");
    }).catch(err => {
        console.error("Failed to copy: ", err);
    });
}
