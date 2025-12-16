// Convert string <-> Uint8Array helpers
function strToUint8(str) {
    return new TextEncoder().encode(str);
}

function uint8ToStr(uint8) {
    return new TextDecoder().decode(uint8);
}

// Derive AES key from master password using PBKDF2
export async function deriveKey(masterPassword, salt) {
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        strToUint8(masterPassword),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt,
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}

// Encrypt password
export async function encryptPassword(plaintext) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const key = await deriveKey("", salt);

    const ciphertext = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        strToUint8(plaintext)
    );

    return {
        salt: btoa(String.fromCharCode(...salt)),
        iv: btoa(String.fromCharCode(...iv)),
        ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext)))
    };
}

// Decrypt password
export async function decryptPassword(encryptedData) {
    const salt = Uint8Array.from(atob(encryptedData.salt), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(encryptedData.iv), c => c.charCodeAt(0));
    const ciphertext = Uint8Array.from(atob(encryptedData.ciphertext), c => c.charCodeAt(0));

    const key = await deriveKey("", salt);

    const plaintextBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        ciphertext
    );

    return uint8ToStr(new Uint8Array(plaintextBuffer));
}