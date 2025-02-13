const platforms = [
    { 
        name: "Facebook", 
        url: "https://www.facebook.com/", 
        icon: "fab fa-facebook", 
        notFoundText: "This Page Isn't Available" 
    },
    { 
        name: "Twitter", 
        url: "https://twitter.com/", 
        icon: "fab fa-twitter", 
        notFoundText: "This account doesn’t exist" 
    },
    { 
        name: "Instagram", 
        url: "https://www.instagram.com/", 
        icon: "fab fa-instagram", 
        notFoundText: "Sorry, this page isn't available" 
    },
    { 
        name: "LinkedIn", 
        url: "https://www.linkedin.com/in/", 
        icon: "fab fa-linkedin", 
        notFoundText: "Profile Not Found" 
    },
    { 
        name: "Reddit", 
        url: "https://www.reddit.com/user/", 
        icon: "fab fa-reddit", 
        notFoundText: "page not found" 
    },
    { 
        name: "TikTok", 
        url: "https://www.tiktok.com/@", 
        icon: "fab fa-tiktok", 
        notFoundText: "Couldn't find this account" 
    },
    { 
        name: "YouTube", 
        url: "https://www.youtube.com/@", 
        icon: "fab fa-youtube", 
        notFoundText: "This channel does not exist" 
    },
    { 
        name: "Snapchat", 
        url: "https://www.snapchat.com/add/", 
        icon: "fab fa-snapchat", 
        check: false 
    }, 
    { 
        name: "Telegram", 
        url: "https://t.me/", 
        icon: "fab fa-telegram", 
        check: false 
    },
    { 
        name: "Pinterest", 
        url: "https://www.pinterest.com/", 
        icon: "fab fa-pinterest", 
        notFoundText: "Oops! That page can’t be found" 
    },
    { 
        name: "GitHub", 
        url: "https://github.com/", 
        icon: "fab fa-github", 
        notFoundText: "Not Found" 
    }
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

        try {
            // 🕒 Add delay to avoid getting blocked
            await new Promise(resolve => setTimeout(resolve, Math.random() * 1500 + 1500));

            // 🛠️ Fetch the profile page
            const response = await fetch(profileURL);
            const pageText = await response.text(); // Convert page to text

            if (platform.notFoundText && pageText.includes(platform.notFoundText)) {
                // 🚫 User does NOT exist
                resultsHTML += `
                    <p class="platform ${platformClass}">
                        <i class="${iconClass}" style="color: var(--${platformClass}, #e0e0e0);"></i> 
                        <b style="color: var(--${platformClass}, #e0e0e0);">${platform.name}</b>: 
                        ❌ Not Found
                    </p>
                `;
            } else {
                // ✅ User EXISTS
                resultsHTML += `
                    <p class="platform ${platformClass}">
                        <i class="${iconClass}" style="color: var(--${platformClass}, #e0e0e0);"></i> 
                        <b style="color: var(--${platformClass}, #e0e0e0);">${platform.name}</b>: 
                        <a href="${profileURL}" target="_blank">${profileURL}</a>
                    </p>
                `;
                linksArray.push(profileURL);
            }
        } catch (error) {
            resultsHTML += `
                <p class="platform ${platformClass}">
                    <i class="${iconClass}" style="color: var(--${platformClass}, #e0e0e0);"></i> 
                    <b style="color: var(--${platformClass}, #e0e0e0);">${platform.name}</b>: 
                    ⚠️ Error Checking
                </p>
            `;
        }
    }

    resultsDiv.innerHTML = resultsHTML;

    if (linksArray.length > 0) {
        document.getElementById("copyButton").style.display = "block";
    }
}

