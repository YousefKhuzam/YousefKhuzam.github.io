const platforms = [
    { name: "Facebook", url: "https://www.facebook.com/" },
    { name: "Telegram", url: "https://t.me/" },
    { name: "Snapchat", url: "https://www.snapchat.com/add/" },
    { name: "YouTube", url: "https://www.youtube.com/@" },
    { name: "Twitter", url: "https://twitter.com/" },
    { name: "Instagram", url: "https://www.instagram.com/" },
    { name: "Reddit", url: "https://www.reddit.com/user/" },
    { name: "LinkedIn", url: "https://www.linkedin.com/in/" },  
    { name: "Pinterest", url: "https://www.pinterest.com/" },  
    { name: "TikTok", url: "https://www.tiktok.com/@" },  
    { name: "GitHub", url: "https://github.com/" }  
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
        resultsHTML += `<p>✅ <b>${platform.name}</b>: <a href="${profileURL}" target="_blank">${profileURL}</a></p>`;
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
