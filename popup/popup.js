import { hashPassword } from '../scripts/hash.js';

const submitBtn = document.getElementById("submitBtn");
const passwordInput = document.getElementById("masterPassword");
const messageDiv = document.getElementById("message");

document.querySelector("form").addEventListener("submit", e => e.preventDefault());

function checkMasterPasswordSetup() {
    chrome.storage.local.get("masterHash", (result) => {
        if (result.masterHash) {
            messageDiv.innerText = "Enter your master password to unlock:";
            submitBtn.onclick = () => verifyMasterPassword(passwordInput.value, result.masterHash);
        } else {
            submitBtn.onclick = () => setMasterPassword(passwordInput.value);
        }
    });
}

function setMasterPassword(password) {
    hashPassword(password)
        .then(hash => {
            chrome.storage.local.set({ masterHash: hash }, () => {
                messageDiv.innerText = "Master password set! Please reopen extension.";
            });
        })
        .catch(err => {
            console.error(err);
            messageDiv.innerText = "Error setting password.";
        });
}

function verifyMasterPassword(password, storedHash) {
    hashPassword(password)
        .then(hash => {
            if (hash === storedHash) {
                messageDiv.innerText = "Access granted! Welcome.";
                window.location.href = "passwords.html";
                const SESSION_DURATION_MS = 5 * 60 * 1000; 

                function setSession() {
                    const expiresAt = Date.now() + SESSION_DURATION_MS;
                    chrome.storage.local.set({ sessionExpires: expiresAt });
                }
                setSession();
            } else {
                messageDiv.innerText = "Wrong password!";
            }
        })
        .catch(err => {
            console.error(err);
            messageDiv.innerText = "Error verifying password.";
        });
}

function checkSession() {
    chrome.storage.local.get(["sessionExpires", "masterHash"], async (data) => {
        const now = Date.now();

        if (data.sessionExpires && data.sessionExpires > now) {
            messageDiv.innerText = "Vault unlocked!";
            window.location.href = "passwords.html"; 
        } else {
            messageDiv.innerText = "Enter your master password to unlock:";
            submitBtn.onclick = () => verifyMasterPassword(passwordInput.value, data.masterHash);
        }
    });
}

checkMasterPasswordSetup();
checkSession();
