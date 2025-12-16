// Convert a string to ArrayBuffer
function str2ab(str) {
    const encoder = new TextEncoder();
    return encoder.encode(str);
}

// Convert ArrayBuffer to hex string
function ab2hex(buffer) {
    const hashArray = Array.from(new Uint8Array(buffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Hash a password using SHA-256
async function hashPassword(password) {
    const data = str2ab(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return ab2hex(hashBuffer);
}
export { hashPassword };