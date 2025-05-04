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