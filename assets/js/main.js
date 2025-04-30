// Base64 Encoding
function base64Encode() {
    let input = document.getElementById("inputText").value.trim();
    let output = btoa(unescape(encodeURIComponent(input)));
    document.getElementById("outputText").value = output;
}

// Base64 Decoding
function base64Decode() {
    let input = document.getElementById("inputText").value.trim();
    try {
        let output = decodeURIComponent(escape(atob(input)));
        document.getElementById("outputText").value = output;
    } catch (e) {
        alert("Invalid Base64 input");
    }
}

// SHA-256 Hashing
async function generateSHA256() {
    let input = document.getElementById("inputText").value.trim();
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    document.getElementById("outputText").value = hashHex;
}

// Simple Caesar Cipher Encryption
function caesarCipherEncrypt() {
    let input = document.getElementById("inputText").value.trim();
    let shift = 3; // Shift by 3 characters
    let output = input.split("").map(char => {
        if (char.match(/[a-zA-Z]/)) {
            let code = char.charCodeAt(0);
            let shiftBase = code >= 65 && code <= 90 ? 65 : 97;
            return String.fromCharCode(((code - shiftBase + shift) % 26) + shiftBase);
        }
        return char;
    }).join("");
    document.getElementById("outputText").value = output;
}

// Simple Caesar Cipher Decryption
function caesarCipherDecrypt() {
    let input = document.getElementById("inputText").value.trim();
    let shift = 3; // Shift by 3 characters
    let output = input.split("").map(char => {
        if (char.match(/[a-zA-Z]/)) {
            let code = char.charCodeAt(0);
            let shiftBase = code >= 65 && code <= 90 ? 65 : 97;
            return String.fromCharCode(((code - shiftBase - shift + 26) % 26) + shiftBase);
        }
        return char;
    }).join("");
    document.getElementById("outputText").value = output;
}

// Function to Defang URLs (convert them to a safer format)
function defangURL() {
    let input = document.getElementById("inputText").value;
    let defanged = input.replace(/http/g, "hxxp").replace(/\./g, "[.]");
    document.getElementById("outputText").value = defanged;
}

// Function to Fang URLs (convert back to normal)
function fangURL() {
    let input = document.getElementById("inputText").value;
    let fanged = input.replace(/hxxp/g, "http").replace(/\[\.\]/g, ".");
    document.getElementById("outputText").value = fanged;
}

function decodeURL() {
    let input = document.getElementById("inputText").value.trim();

    try {
        let urlObj = new URL(input);

        // Decode Punycode domain
        let decodedHost = urlObj.hostname;
        if (decodedHost.includes("xn--")) {
            try {
                decodedHost = new URL("http://" + decodedHost).hostname;
                decodedHost = decodeURIComponent(decodedHost);
            } catch (e) {
                // Fallback
                decodedHost = urlObj.hostname;
            }
        }

        // Decode path and query
        let decodedPath = decodeURIComponent(urlObj.pathname);
        let decodedQuery = decodeURIComponent(urlObj.search);

        // Reconstruct final URL
        let decoded = `${urlObj.protocol}//${decodedHost}${decodedPath}${decodedQuery}`;
        document.getElementById("outputText").value = decoded;

    } catch (error) {
        // If it's not a full URL, fallback to normal decoding
        try {
            let fallback = decodeURIComponent(input);
            document.getElementById("outputText").value = fallback;
        } catch (e) {
            alert("Invalid input");
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ DOM Loaded - Running script.js");

    // 🌙 Dark Mode Toggle (Fix Applied)
    const themeToggle = document.querySelector('.theme-toggle');

    if (!themeToggle) {
        console.error("❌ Theme toggle button not found! Check your HTML.");
    } else {
        function toggleTheme() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        }

        themeToggle.addEventListener('click', toggleTheme);

        // Apply saved theme on page load
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    // 📖 Read More Button Toggle
    document.querySelectorAll(".read-more-btn").forEach(button => {
        button.addEventListener("click", function () {
            let content = this.nextElementSibling;
            if (content && content.classList.contains("read-more-content")) {
                content.classList.toggle("show");
                this.textContent = content.classList.contains("show") ? "Show Less" : "Read More";
            } else {
                console.error("❌ No .read-more-content found after this button.");
            }
        });
    });

    // 📜 Blog Read More Toggle
    const blogReadMore = document.getElementById("full-blog");
    const blogButton = document.querySelector(".read-more-btn");

    if (blogReadMore && blogButton) {
        blogButton.addEventListener("click", function () {
            blogReadMore.style.display = (blogReadMore.style.display === "none" || blogReadMore.style.display === "") ? "block" : "none";
        });
    }

    // 📂 Mobile Menu Toggle
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", function () {
            navLinks.classList.toggle("active");
        });
    } else {
        console.warn("⚠️ Mobile menu elements not found. Skipping menu toggle setup.");
    }

    // 🔄 Smooth Scroll Effect
    document.querySelectorAll("a[href^='#']").forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute("href")).scrollIntoView({
                behavior: "smooth"
            });
        });
    });

    // 📄 CV Popup
    const cvPopup = document.getElementById("cv-popup");
    const closeCVPopup = document.querySelector(".close-btn");
    
    if (cvPopup && closeCVPopup) {
        document.querySelector(".cv-btn").addEventListener("click", function () {
            cvPopup.style.display = "flex";
        });

        closeCVPopup.addEventListener("click", function () {
            cvPopup.style.display = "none";
        });

        window.addEventListener("click", function (event) {
            if (event.target === cvPopup) {
                cvPopup.style.display = "none";
            }
        });
    } else {
        console.warn("⚠️ CV Popup elements not found. Skipping CV popup setup.");
    }

    // 🌐 Particles.js Background
    if (document.getElementById("particles-js")) {
        particlesJS.load('particles-js', 'assets/config/particles-config.json', function() {
            console.log('Particles.js loaded!');
        });
    } else {
        console.warn("⚠️ Particles.js container not found. Skipping background effect.");
    }
});
