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
    let input = document.getElementById("inputText").value;
    let output = btoa(input);
    document.getElementById("outputText").value = output;
}

// Base64 Decoding
function base64Decode() {
    let input = document.getElementById("inputText").value;
    try {
        let output = atob(input);
        document.getElementById("outputText").value = output;
    } catch (e) {
        alert("Invalid Base64 input");
    }
}

// SHA-256 Hashing (From CyberChef logic)
async function generateSHA256() {
    let input = document.getElementById("inputText").value;
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    document.getElementById("outputText").value = hashHex;
}

// MD5 Hashing (Using CyberChef logic)
async function generateMD5() {
    let input = document.getElementById("inputText").value;
    const msgBuffer = new TextEncoder().encode(input);
    const hashBuffer = await crypto.subtle.digest('MD5', msgBuffer).catch(() => {
        alert("MD5 is not supported in modern browsers");
    });
    if (hashBuffer) {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        document.getElementById("outputText").value = hashHex;
    }
}

// Caesar Cipher Encryption
function caesarCipherEncrypt() {
    let input = document.getElementById("inputText").value;
    let shift = 3; // You can modify this
    let output = input.split('').map(char => {
        if (char.match(/[a-z]/i)) {
            let code = char.charCodeAt(0);
            let shiftBase = code >= 65 && code <= 90 ? 65 : 97;
            return String.fromCharCode(((code - shiftBase + shift) % 26) + shiftBase);
        }
        return char;
    }).join('');
    document.getElementById("outputText").value = output;
}

// Caesar Cipher Decryption
function caesarCipherDecrypt() {
    let input = document.getElementById("inputText").value;
    let shift = 3;
    let output = input.split('').map(char => {
        if (char.match(/[a-z]/i)) {
            let code = char.charCodeAt(0);
            let shiftBase = code >= 65 && code <= 90 ? 65 : 97;
            return String.fromCharCode(((code - shiftBase - shift + 26) % 26) + shiftBase);
        }
        return char;
    }).join('');
    document.getElementById("outputText").value = output;
}
