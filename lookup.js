const platforms = [
    { name: "Twitter", url: "https://twitter.com/" },
    { name: "Instagram", url: "https://instagram.com/" },
    { name: "GitHub", url: "https://github.com/" },
    { name: "Reddit", url: "https://www.reddit.com/user/" }
];

async function checkUsername(platform, username) {
    let profileUrl = platform.url + username;
    let response;

    try {
        response = await fetch(profileUrl, { method: "GET" }); // Use GET instead of HEAD
        let text = await response.text();

        if (response.status === 404) {
            return { platform: platform.name, status: "❌ Not Found", url: profileUrl };
        }

        // Check if the username appears in the page (basic verification)
        if (text.includes(username)) {
            return { platform: platform.name, status: "✅ Found", url: profileUrl };
        } else {
            return { platform: platform.name, status: "❓ Could Not Verify", url: profileUrl };
        }

    } catch (error) {
        return { platform: platform.name, status: "⚠️ Error", url: profileUrl };
    }
}

async function lookupUsername() {
    let username = document.getElementById("usernameInput").value.trim();
    let resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    if (username === "") {
        resultsDiv.innerHTML = "<p style='color: red;'>⚠️ Please enter a username.</p>";
        return;
    }

    resultsDiv.innerHTML = "<p>🔍 Searching...</p>";

    let results = await Promise.all(platforms.map(platform => checkUsername(platform, username)));

    resultsDiv.innerHTML = results.map(result =>
        `<p><strong>${result.platform}:</strong> <a href="${result.url}" target="_blank">${result.status}</a></p>`
    ).join("");
}
