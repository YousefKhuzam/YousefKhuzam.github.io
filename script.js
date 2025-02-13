// Dark Mode Toggle (Keeping Your Theme)
const toggleButton = document.querySelector('.theme-toggle');
toggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

// Remember Dark Mode Preference
if (localStorage.getItem('darkMode') === "true") {
    document.body.classList.add('dark-mode');
}

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

function toggleMenu() {
    document.querySelector('.nav-links').classList.toggle('active');
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

document.addEventListener("DOMContentLoaded", function () {
    // Toggle Read More Sections
    document.querySelectorAll(".read-more-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
            let content = this.nextElementSibling;
            content.style.display = content.style.display === "block" ? "none" : "block";
            this.textContent = content.style.display === "block" ? "Show Less" : "Read More";
        });
    });

    // Mobile Menu Toggle
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    menuToggle.addEventListener("click", function () {
        navLinks.classList.toggle("active");
    });

    // Smooth Scroll Effect
    document.querySelectorAll("a[href^='#']").forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute("href")).scrollIntoView({
                behavior: "smooth"
            });
        });
    });
});
