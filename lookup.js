const platforms = [
    { name: "Twitter", url: "https://twitter.com/", check: "https://twitter.com/" },
    { name: "Instagram", url: "https://instagram.com/", check: "https://instagram.com/" },
    { name: "GitHub", url: "https://github.com/", check: "https://github.com/" },
    { name: "Reddit", url: "https://www.reddit.com/user/", check: "https://www.reddit.com/user/" }
];

function lookupUsername() {
    let username = document.getElementById("usernameInput").value.trim();
    let resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    if (username === "") {
        resultsDiv.innerHTML = "<p style='color: red;'>⚠️ Please enter a username.</p>";
        return;
    }

    platforms.forEach(platform => {
        let profileUrl = platform.url + username;
        fetch(profileUrl, { method: "HEAD" })
            .then(response => {
                let status = response.ok ? "✅ Found" : "❌ Not Found";
                resultsDiv.innerHTML += `<p><strong>${platform.name}:</strong> <a href="${profileUrl}" target="_blank">${status}</a></p>`;
            })
            .catch(() => {
                resultsDiv.innerHTML += `<p><strong>${platform.name}:</strong> ❓ Error</p>`;
            });
    });
}
