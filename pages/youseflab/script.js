// Input/Output Controls
function clearInput() {
    document.getElementById('inputText').value = '';
}

function clearOutput() {
    document.getElementById('outputText').value = '';
}

async function pasteInput() {
    try {
        const text = await navigator.clipboard.readText();
        document.getElementById('inputText').value = text;
    } catch (err) {
        console.error('Failed to read clipboard:', err);
    }
}

function copyOutput() {
    const outputText = document.getElementById('outputText');
    outputText.select();
    document.execCommand('copy');
    
    // Show feedback
    const copyBtn = document.querySelector('[onclick="copyOutput()"]');
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => {
        copyBtn.innerHTML = originalText;
    }, 1000);
}

// Encoding/Decoding Operations
function base64Encode() {
    const input = document.getElementById('inputText').value;
    const output = btoa(input);
    document.getElementById('outputText').value = output;
}

function base64Decode() {
    const input = document.getElementById('inputText').value;
    try {
        const output = atob(input);
        document.getElementById('outputText').value = output;
    } catch (e) {
        document.getElementById('outputText').value = 'Error: Invalid Base64 input';
    }
}

function hexEncode() {
    const input = document.getElementById('inputText').value;
    let output = '';
    for (let i = 0; i < input.length; i++) {
        output += input.charCodeAt(i).toString(16).padStart(2, '0');
    }
    document.getElementById('outputText').value = output;
}

function hexDecode() {
    const input = document.getElementById('inputText').value;
    try {
        let output = '';
        for (let i = 0; i < input.length; i += 2) {
            output += String.fromCharCode(parseInt(input.substr(i, 2), 16));
        }
        document.getElementById('outputText').value = output;
    } catch (e) {
        document.getElementById('outputText').value = 'Error: Invalid hex input';
    }
}

function binaryEncode() {
    const input = document.getElementById('inputText').value;
    let output = '';
    for (let i = 0; i < input.length; i++) {
        output += input.charCodeAt(i).toString(2).padStart(8, '0') + ' ';
    }
    document.getElementById('outputText').value = output.trim();
}

function binaryDecode() {
    const input = document.getElementById('inputText').value;
    try {
        const binaryArray = input.split(' ');
        let output = '';
        for (let binary of binaryArray) {
            output += String.fromCharCode(parseInt(binary, 2));
        }
        document.getElementById('outputText').value = output;
    } catch (e) {
        document.getElementById('outputText').value = 'Error: Invalid binary input';
    }
}

// Hashing Operations
async function generateMD5() {
    const input = document.getElementById('inputText').value;
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hash = await crypto.subtle.digest('MD5', data);
    const hexArray = Array.from(new Uint8Array(hash));
    const hexString = hexArray.map(b => b.toString(16).padStart(2, '0')).join('');
    document.getElementById('outputText').value = hexString;
}

async function generateSHA1() {
    const input = document.getElementById('inputText').value;
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hash = await crypto.subtle.digest('SHA-1', data);
    const hexArray = Array.from(new Uint8Array(hash));
    const hexString = hexArray.map(b => b.toString(16).padStart(2, '0')).join('');
    document.getElementById('outputText').value = hexString;
}

async function generateSHA256() {
    const input = document.getElementById('inputText').value;
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hash = await crypto.subtle.digest('SHA-256', data);
    const hexArray = Array.from(new Uint8Array(hash));
    const hexString = hexArray.map(b => b.toString(16).padStart(2, '0')).join('');
    document.getElementById('outputText').value = hexString;
}

async function generateSHA512() {
    const input = document.getElementById('inputText').value;
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hash = await crypto.subtle.digest('SHA-512', data);
    const hexArray = Array.from(new Uint8Array(hash));
    const hexString = hexArray.map(b => b.toString(16).padStart(2, '0')).join('');
    document.getElementById('outputText').value = hexString;
}

// Encryption Operations
function caesarCipherEncrypt() {
    const input = document.getElementById('inputText').value;
    const shift = 3; // Standard Caesar shift
    let output = '';
    
    for (let i = 0; i < input.length; i++) {
        let char = input[i];
        if (char.match(/[a-z]/i)) {
            const code = input.charCodeAt(i);
            if (code >= 65 && code <= 90) {
                char = String.fromCharCode(((code - 65 + shift) % 26) + 65);
            } else if (code >= 97 && code <= 122) {
                char = String.fromCharCode(((code - 97 + shift) % 26) + 97);
            }
        }
        output += char;
    }
    
    document.getElementById('outputText').value = output;
}

function caesarCipherDecrypt() {
    const input = document.getElementById('inputText').value;
    const shift = 3; // Standard Caesar shift
    let output = '';
    
    for (let i = 0; i < input.length; i++) {
        let char = input[i];
        if (char.match(/[a-z]/i)) {
            const code = input.charCodeAt(i);
            if (code >= 65 && code <= 90) {
                char = String.fromCharCode(((code - 65 - shift + 26) % 26) + 65);
            } else if (code >= 97 && code <= 122) {
                char = String.fromCharCode(((code - 97 - shift + 26) % 26) + 97);
            }
        }
        output += char;
    }
    
    document.getElementById('outputText').value = output;
}

function xorEncrypt() {
    const input = document.getElementById('inputText').value;
    const key = prompt('Enter encryption key:');
    if (!key) return;
    
    let output = '';
    for (let i = 0; i < input.length; i++) {
        output += String.fromCharCode(input.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    document.getElementById('outputText').value = output;
}

function xorDecrypt() {
    const input = document.getElementById('inputText').value;
    const key = prompt('Enter decryption key:');
    if (!key) return;
    
    let output = '';
    for (let i = 0; i < input.length; i++) {
        output += String.fromCharCode(input.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    document.getElementById('outputText').value = output;
}

// URL Operations
function defangURL() {
    const input = document.getElementById('inputText').value;
    let output = input
        .replace(/\./g, '[.]')
        .replace(/http/g, 'hxxp')
        .replace(/https/g, 'hxxps');
    document.getElementById('outputText').value = output;
}

function fangURL() {
    const input = document.getElementById('inputText').value;
    let output = input
        .replace(/\[\.\]/g, '.')
        .replace(/hxxp/g, 'http')
        .replace(/hxxps/g, 'https');
    document.getElementById('outputText').value = output;
}

function encodeURL() {
    const input = document.getElementById('inputText').value;
    const output = encodeURIComponent(input);
    document.getElementById('outputText').value = output;
}

function decodeURL() {
    const input = document.getElementById('inputText').value;
    try {
        const output = decodeURIComponent(input);
        document.getElementById('outputText').value = output;
    } catch (e) {
        document.getElementById('outputText').value = 'Error: Invalid URL encoding';
    }
}

// Text Manipulation
function reverseText() {
    const input = document.getElementById('inputText').value;
    const output = input.split('').reverse().join('');
    document.getElementById('outputText').value = output;
}

function toUpperCase() {
    const input = document.getElementById('inputText').value;
    const output = input.toUpperCase();
    document.getElementById('outputText').value = output;
}

function toLowerCase() {
    const input = document.getElementById('inputText').value;
    const output = input.toLowerCase();
    document.getElementById('outputText').value = output;
}

function removeWhitespace() {
    const input = document.getElementById('inputText').value;
    const output = input.replace(/\s+/g, '');
    document.getElementById('outputText').value = output;
}

// Analysis Operations
function countCharacters() {
    const input = document.getElementById('inputText').value;
    const output = `Character count: ${input.length}`;
    document.getElementById('outputText').value = output;
}

function countWords() {
    const input = document.getElementById('inputText').value;
    const words = input.trim().split(/\s+/);
    const output = `Word count: ${words.length}`;
    document.getElementById('outputText').value = output;
}

function countLines() {
    const input = document.getElementById('inputText').value;
    const lines = input.split('\n');
    const output = `Line count: ${lines.length}`;
    document.getElementById('outputText').value = output;
}

function findIPs() {
    const input = document.getElementById('inputText').value;
    const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
    const ips = input.match(ipRegex) || [];
    const output = ips.length > 0 ? ips.join('\n') : 'No IP addresses found';
    document.getElementById('outputText').value = output;
}

// Base32 Encode/Decode
function base32Encode() {
    const input = document.getElementById('inputText').value;
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '', output = '';
    for (let i = 0; i < input.length; i++) {
        bits += input.charCodeAt(i).toString(2).padStart(8, '0');
    }
    for (let i = 0; i < bits.length; i += 5) {
        const chunk = bits.substr(i, 5);
        if (chunk.length < 5) output += alphabet[parseInt(chunk.padEnd(5, '0'), 2)];
        else output += alphabet[parseInt(chunk, 2)];
    }
    document.getElementById('outputText').value = output;
}

function base32Decode() {
    const input = document.getElementById('inputText').value.replace(/=+$/, '');
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '', output = '';
    for (let i = 0; i < input.length; i++) {
        const val = alphabet.indexOf(input[i].toUpperCase());
        if (val === -1) continue;
        bits += val.toString(2).padStart(5, '0');
    }
    for (let i = 0; i + 8 <= bits.length; i += 8) {
        output += String.fromCharCode(parseInt(bits.substr(i, 8), 2));
    }
    document.getElementById('outputText').value = output;
}

// Hash Identifier (simple heuristic)
function identifyHash() {
    const input = document.getElementById('inputText').value.trim();
    let type = 'Unknown';
    if (/^[a-f0-9]{32}$/i.test(input)) type = 'MD5';
    else if (/^[a-f0-9]{40}$/i.test(input)) type = 'SHA-1';
    else if (/^[a-f0-9]{64}$/i.test(input)) type = 'SHA-256';
    else if (/^[a-f0-9]{128}$/i.test(input)) type = 'SHA-512';
    else if (/^[A-Za-z0-9\/\.]{22}==$/.test(input)) type = 'bcrypt';
    else if (/^\$2[aby]\$\d{2}\$[A-Za-z0-9\/\.]{53}$/.test(input)) type = 'bcrypt';
    document.getElementById('outputText').value = 'Possible hash type: ' + type;
}

// JWT Decoder
function decodeJWT() {
    const input = document.getElementById('inputText').value.trim();
    const parts = input.split('.');
    if (parts.length !== 3) {
        document.getElementById('outputText').value = 'Invalid JWT format';
        return;
    }
    try {
        const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        document.getElementById('outputText').value =
            'Header:\n' + JSON.stringify(header, null, 2) +
            '\n\nPayload:\n' + JSON.stringify(payload, null, 2) +
            '\n\nSignature:\n' + parts[2];
    } catch (e) {
        document.getElementById('outputText').value = 'Error decoding JWT';
    }
}

// UUID Generator
function generateUUID() {
    const uuid = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
    document.getElementById('outputText').value = uuid;
}

// Timestamp Converter
function timestampConvert() {
    const input = document.getElementById('inputText').value.trim();
    if (/^\d{10,13}$/.test(input)) {
        // Unix timestamp to date
        const ts = input.length === 13 ? parseInt(input) : parseInt(input) * 1000;
        const date = new Date(ts);
        document.getElementById('outputText').value = date.toISOString();
    } else {
        // Date to Unix timestamp
        const date = new Date(input);
        if (isNaN(date.getTime())) {
            document.getElementById('outputText').value = 'Invalid date or timestamp';
        } else {
            document.getElementById('outputText').value = Math.floor(date.getTime() / 1000);
        }
    }
}

// HTML Entity Encode/Decode
function htmlEntityEncode() {
    const input = document.getElementById('inputText').value;
    const div = document.createElement('div');
    div.textContent = input;
    document.getElementById('outputText').value = div.innerHTML;
}

function htmlEntityDecode() {
    const input = document.getElementById('inputText').value;
    const div = document.createElement('div');
    div.innerHTML = input;
    document.getElementById('outputText').value = div.textContent;
}

// Regex Tester
function regexTest() {
    const input = document.getElementById('inputText').value;
    const pattern = prompt('Enter regex pattern (e.g. \\d+):');
    if (!pattern) return;
    try {
        const re = new RegExp(pattern, 'g');
        const matches = input.match(re);
        document.getElementById('outputText').value = matches ? matches.join('\n') : 'No matches found.';
    } catch (e) {
        document.getElementById('outputText').value = 'Invalid regex pattern.';
    }
}

// String Escape/Unescape
function escapeString() {
    const input = document.getElementById('inputText').value;
    document.getElementById('outputText').value = JSON.stringify(input);
}

function unescapeString() {
    const input = document.getElementById('inputText').value;
    try {
        document.getElementById('outputText').value = JSON.parse(input);
    } catch (e) {
        document.getElementById('outputText').value = 'Invalid escaped string.';
    }
}

// Password Generator
function generatePassword() {
    const length = parseInt(prompt('Password length (8-64):', '16'));
    if (isNaN(length) || length < 8 || length > 64) {
        document.getElementById('outputText').value = 'Invalid length.';
        return;
    }
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    document.getElementById('outputText').value = password;
} 