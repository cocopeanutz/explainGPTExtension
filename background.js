function createNotification(message){
    browser.notifications.create({
        type: "basic",
        iconUrl: browser.extension.getURL("icons/icon48.png"),
        title: "Translation",
        message: message,
    });
};

function promptTemplate(message){
    // return `Please explain to me about the meaning \"'${message}'\"`
    // return `Please explain to me about the meaning of \"'${message}'\", phrase by phrase, if it's chinese at the start please write the pinyin first`
    return `Please explain to me about the meaning of \"'${message}'\", focus on the grammatical structure`
};


browser.contextMenus.create({
  id: "translateWithGPT",
  title: "Explain With ChatGPT",
  contexts: ["selection"],
});

function updateResultOnPopup(replyMessage){
    browser.storage.local.set({ "lastReplyMessage": replyMessage })
    .then(() => {
        console.log("ChatGPT reply message stored successfully!");
    })
    .catch(error => {
        console.error("Error storing reply message", error);
    });
};

function contactOpenAIEndpoint(apiKey, message, selectionTopPx, selectionLeftPx){
    // Contact the OpenAPI Endpoint
    fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{"role": "user",
                "content": promptTemplate(message)
            }],
            max_tokens: 2000,
            temperature: 0.7,
        }),
    })
    .then(response => response.json())
    .then(data => {
        replyData = data
        var replyMessage = replyData.choices[0].message.content
        // Handle the API response data here
        console.log(replyMessage);
        //Firefox notification Framework
        createNotification(replyMessage);
        updateResultOnPopup(replyMessage);
    })
    .catch(error => {
    // Handle any error that occurs during the API request
        console.error('Error:', error);
        createNotification("GPT Error, please check OpenAI Key")
    });
}

function explainWithGPT(message, selectionTopPx, selectionLeftPx){
    // Get the Open API Key from local browser local storage
    browser.storage.local.get("openaiKey")
    .then(result => {
        var apiKey = result.openaiKey;
        createNotification("OpenAI API key is there");
        contactOpenAIEndpoint(apiKey, message, selectionTopPx, selectionLeftPx);
    })
    .catch(error => {
        console.error("Error retrieving API Key:", error);
        createNotification("Error, Check if OpenAI API key is there");
        return
    });
}

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "translateWithGPT") {
    // Handle the menu item click here
    console.log("Selected text:", info.selectionText);
    explainWithGPT(info.selectionText)

  }
});

// function createNewTab(){
//     browser.tabs.query({ currentWindow: true, active: true }).then((tabs) => {
//         const currentTab = tabs[0];
//         const currentIndex = currentTab.index;
//
//         browser.tabs.create({
//             url: browser.extension.getURL('resultPage.html'),
//             index: currentIndex + 1,
//             active: false
//         });
//     });
// }




browser.commands.onCommand.addListener(async command => {
    if (command === "explainWithGPTCommand") {
        try {
            // createNewTab();
            const activeTab = await browser.tabs.query({ active: true, currentWindow: true });
            const tabId = activeTab[0].id;

            const selectionTopPx = await browser.tabs.executeScript(tabId, {
                code: "window.getSelection().getRangeAt(0).getBoundingClientRect().top;"
            });
            const selectionLeftPx = await browser.tabs.executeScript(tabId, {
                code: "window.getSelection().getRangeAt(0).getBoundingClientRect().left;"
            });


            const highlightedText = await browser.tabs.executeScript(tabId, {
                code: "window.getSelection().toString();"
            });
            console.log("Highlighted text:", highlightedText[0]);
            // Add your desired logic here
            explainWithGPT(highlightedText[0], selectionTopPx, selectionLeftPx);
        } catch (error) {
            console.error("Error retrieving highlighted text:", error);
        }
    }
});
