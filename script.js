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

// Fake Threat Intelligence Feed
const threatFeed = document.getElementById('threat-feed');
const threats

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

// MD5 Hashing (Not natively supported in modern browsers)
async function generateMD5() {
    let input = document.getElementById("inputText").value.trim();
    alert("MD5 hashing is not supported in modern browsers. Use SHA-256 instead.");
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
