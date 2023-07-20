import * as compat from "./util.js"
import {createNotification, mainControl} from "./util.js"


function promptTemplate(message){
    // return `Please explain to me about the meaning \"'${message}'\"`
    // return `Please explain to me about the meaning of \"'${message}'\", phrase by phrase, if it's chinese at the start please write the pinyin first`
    return `Please explain to me about the meaning of \"'${message}'\", focus on the grammatical structure`
};


mainControl.contextMenus.create({
  id: "translateWithGPT",
  title: "Explain With ChatGPT",
  contexts: ["selection"],
});

function updateResultOnPopup(replyMessage){
    mainControl.storage.local.set({ "lastReplyMessage": replyMessage })
    .then(() => {
        console.log("ChatGPT reply message stored successfully!");
    })
    .catch(error => {
        console.error("Error storing reply message", error);
    });
};

function contactOpenAIEndpoint(apiKey, message){
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
        var replyData = data
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

function explainWithGPT(message){
    // Get the Open API Key from local browser local storage
    compat.storageGet("openaiKey",
        //callback
        result => {
            try{
                var apiKey = result.openaiKey;
                if(apiKey==null){throw Error};
                createNotification("OpenAI API key is there");

                var browserName = compat.queryBrowserName();
                if(browserName == 'firefox'){
                    contactOpenAIEndpoint(apiKey, message);
                } else if(browserName == 'chrome'){
                    contactOpenAIEndpoint(apiKey.openaiKey, message);    
                }
            } catch(error){
                console.error("Error retrieving API Key:", error);
                createNotification("Error, Check if OpenAI API key is there");
                return
            }
        }
    )
}

mainControl.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "translateWithGPT") {
    // Handle the menu item click here
    console.log("Selected text:", info.selectionText);
    explainWithGPT(info.selectionText)

  }
});

// function createNewTab(){
//     mainControl.tabs.query({ currentWindow: true, active: true }).then((tabs) => {
//         const currentTab = tabs[0];
//         const currentIndex = currentTab.index;
//
//         mainControl.tabs.create({
//             url: mainControl.extension.getURL('resultPage.html'),
//             index: currentIndex + 1,
//             active: false
//         });
//     });
// }




mainControl.commands.onCommand.addListener(async command => {
    try{
        compat.getCurrentTab(activeTab => {
            const tabId = activeTab[0].id;

            compat.getHighlightedText(tabId,
            highlightedText => {
                explainWithGPT(highlightedText)
            })
        })
    } catch (error) {
        console.error("Error retrieving highlighted text:", error);
    }
});
