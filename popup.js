import * as compat from "./util.js"
import {createNotification, mainControl} from "./util.js"


var keyInput = document.getElementById("openai_key_input");
var storeButton = document.getElementById("storeButton");

document.getElementById("storeButton").addEventListener("click", () => {
  // Notify the background script to display a notification
    // mainControl.runtime.sendMessage({ action: "notify" });

    var key = keyInput.value;

    compat.storageSet({ "openaiKey": key });
});


compat.storageGet("lastReplyMessage",
    result => {
        try{
            document.getElementById("resultText").textContent = result.lastReplyMessage;
        } catch(error) {
            console.error("Unable to get last chatgpt reply");
            return;
        }
    }
);


mainControl.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.updatePopup) {
    // Update the popup HTML content
    document.getElementById("resultText").textContent = message.data;
  }
});
