const platforms = [
    { name: "Facebook", url: "https://www.facebook.com/", check: true },
    { name: "Telegram", url: "https://t.me/", check: false },
    { name: "Snapchat", url: "https://www.snapchat.com/add/", check: false },
    { name: "YouTube", url: "https://www.youtube.com/@", check: false },
    { name: "Twitter", url: "https://twitter.com/", check: true },
    { name: "Instagram", url: "https://www.instagram.com/", check: true },
    { name: "Reddit", url: "https://www.reddit.com/user/", check: true },
    { name: "LinkedIn", url: "https://www.linkedin.com/in/", check: true },  
    { name: "Pinterest", url: "https://www.pinterest.com/", check: true },  
    { name: "TikTok", url: "https://www.tiktok.com/@", check: true },  
    { name: "GitHub", url: "https://github.com/", check: true }  
];

function handleKeyPress(event) {
    if (event.key === "Enter") {
        lookupUsername();
    }
}

async function lookupUsername() {
    const username = document.getElementById("usernameInput").value.trim();
    if (!username) {
        alert("Please enter a username!");
        return;
    }

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<p>Checking username availability...</p>";

    let resultsHTML = "<h2>Results:</h2>";

    for (const platform of platforms) {
        const profileURL = `${platform.url}${username}`;
        
        if (platform.check) {
            try {
                const response = await fetch(profileURL, { method: "HEAD" });
                if (response.ok) {
                    resultsHTML += `<p>✅ <b>${platform.name}</b>: <a href="${profileURL}" target="_blank">${profileURL}</a></p>`;
                } else {
                    resultsHTML += `<p>❌ <b>${platform.name}</b>: Not Found</p>`;
                }
            } catch (error) {
                resultsHTML += `<p>⚠️ <b>${platform.name}</b>: Error Checking</p>`;
            }
        } else {
            resultsHTML += `<p>🔗 <b>${platform.name}</b>: <a href="${profileURL}" target="_blank">${profileURL}</a> (Manual Check)</p>`;
        }
    }

    resultsDiv.innerHTML = resultsHTML;
}
