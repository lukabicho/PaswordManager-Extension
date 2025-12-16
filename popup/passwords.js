import { encryptPassword, decryptPassword } from "../scripts/encryption.js";

const formId = document.getElementById("newWebsiteForm");
const addWebsiteBtn = document.getElementById("addWebsiteBtn");
const closeSubmissionBtn = document.getElementById("closeSubmission");

// Wrap in DOMContentLoaded or add null checks
addWebsiteBtn.onclick = () => {
    formId.style.display = "block";
    document.body.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
};

closeSubmissionBtn.onclick = () => {
    formId.style.display = "none";
    document.body.style.backgroundColor = "";
};

const newWebiteBtn = document.getElementById("newSubmission");
newWebiteBtn.onclick = () => {
    const site = document.getElementById("newSite").value;
    const username = document.getElementById("newUsername").value;
    const password = document.getElementById("newPassword").value;
    if (site && username && password) {
        saveLogin(site, username, password);
        alert("Login saved.");
    }
};

async function saveLogin(site, username, password) {
    try {
        const encrypted = await encryptPassword(password);

        chrome.storage.local.get(["savedPasswords"], (res) => {
            if (chrome.runtime.lastError) {
                console.error("storage.get error", chrome.runtime.lastError);
                alert("Failed to access storage.");
                return;
            }

            const saved = Array.isArray(res.savedPasswords) ? res.savedPasswords : [];

            const index = saved.findIndex(
                item => item.site === site && item.username === username
            );

            if (index !== -1) {
                saved[index].encrypted = encrypted;
                saved[index].updatedAt = new Date().toISOString();
            } else {
                saved.push({
                    site,
                    username,
                    encrypted,
                    createdAt: new Date().toISOString()
                });
            }

            chrome.storage.local.set({ savedPasswords: saved }, () => {
                if (chrome.runtime.lastError) {
                    console.error("storage.set error", chrome.runtime.lastError);
                    alert("Failed to save login.");
                    return;
                }
            });
        });
    } catch (err) {
        console.error("saveLogin error", err);
        alert("Failed to save login.");
    }
}


async function loadPasswords() {
    const table = document.getElementById("passwordTable");
    if (!table) return;
    let tbody = table.querySelector("tbody");
    if (!tbody) {
        tbody = document.createElement("tbody");
        table.appendChild(tbody);
    }

    chrome.storage.local.get(["savedPasswords"], async (res) => {
        if (chrome.runtime.lastError) {
            console.error("storage.get error", chrome.runtime.lastError);
            return;
        }
        const rows = Array.isArray(res.savedPasswords) ? res.savedPasswords : [];

        const frag = document.createDocumentFragment();
        for (const entry of rows) {
            let plain = "";
            if (entry.encrypted) {
                try {
                    plain = await decryptPassword(entry.encrypted);
                } catch (e) {
                    console.error("decrypt failed for", entry, e);
                    plain = "[decryption failed]";
                }
            } else if (entry.password) {
                plain = entry.password;
            } else {
                plain = "";
            }

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="site">${escapeHtml(entry.site || "")}</td>
                <td class="username">${escapeHtml(entry.username || "")}</td>
                <td class="password">${escapeHtml(plain)}</td>
            `;
            frag.appendChild(tr);
        }
        tbody.appendChild(frag);
    });

    function escapeHtml(str) {
        return String(str || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }
}


function showCopyToast(text) {
    let toast = document.querySelector(".copy-toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.className = "copy-toast";
        document.body.appendChild(toast);
    }

    toast.textContent = `Copied: ${text}`;
    toast.classList.add("show");

    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 1500);
}


document.addEventListener("click", async (e) => {
    const cell = e.target.closest(".password") || e.target.closest(".username") || e.target.closest(".site");
    if (!cell) return;

    await navigator.clipboard.writeText(cell.innerText);
    showCopyToast(cell.innerText);
});

document.addEventListener("DOMContentLoaded", loadPasswords());
