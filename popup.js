function createNotification(message){
    browser.notifications.create({
        type: "basic",
        iconUrl: browser.extension.getURL("icons/icon48.png"),
        title: "Translation",
        message: message,
    });
};
// Attach a click event listener to the button

var keyInput = document.getElementById("openai_key_input");
var storeButton = document.getElementById("storeButton");

document.getElementById("storeButton").addEventListener("click", () => {
  // Notify the background script to display a notification
    // browser.runtime.sendMessage({ action: "notify" });

    var key = keyInput.value;

    browser.storage.local.set({ "openaiKey": key })
    .then(() => {
        console.log("Key stored successfully!");
        createNotification("OpenAI Key successfully Inputted");
    })
    .catch(error => {
        console.error("Error storing key:", error);
        createNotification("OpenAI Key Input Failed");
    });
});


browser.storage.local.get("lastReplyMessage")
    .then(result => {
        document.getElementById("resultText").textContent = result.lastReplyMessage;
    })
    .catch(error => {
        console.error("Unable to get last chatgpt reply");
        return;
    });


browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.updatePopup) {
    // Update the popup HTML content
    document.getElementById("resultText").textContent = message.data;
  }
});
