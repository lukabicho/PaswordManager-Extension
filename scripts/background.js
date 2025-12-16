chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "FieldDetected") {
        // Forward to popup when it's open
        chrome.storage.local.set({ lastDetected: msg });
    }
});
