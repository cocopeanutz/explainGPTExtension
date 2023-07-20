// Get the main control for the browser
function getMainControl(){
    var browserName = queryBrowserName();
    if (browserName=='firefox') {
        return browser;
    } else if (browserName=='chrome'){
        return chrome;
    } else {
        return null;
    }
}

export function queryBrowserName(){
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('firefox')) {
        console.log('Browser: Firefox');
        return "firefox";
    } else if (userAgent.includes('chrome')) {
        console.log('Browser: Chrome');
        return "chrome";
    } else if (userAgent.includes('safari')) {
        console.log('Browser: Safari');
    } else if (userAgent.includes('opera') || userAgent.includes('opr')) {
        console.log('Browser: Opera');
    } else if (userAgent.includes('edge')) {
        console.log('Browser: Microsoft Edge');
    } else if (userAgent.includes('msie') || userAgent.includes('trident')) {
        console.log('Browser: Internet Explorer');
    } else {
        console.log('Browser: Unknown');
    }
}


export function getCurrentTab(callback){
    var browserName = queryBrowserName();

    if (browserName=='firefox') {
        mainControl.tabs.query({ active: true, currentWindow: true }).then(callback);
    }
    else if (browserName=='chrome'){
        mainControl.tabs.query({ active: true, currentWindow: true }, callback);
    } else{
        console.error("Browser not recognized")
    }
}

export function getHighlightedText(currentTabId, callback){
    var browserName = queryBrowserName();

    if (browserName=='firefox') {
        mainControl.tabs.executeScript(currentTabId, {
            code: "window.getSelection().toString();"
        }).then(callback);
    }
    else if (browserName=='chrome'){
        mainControl.tabs.executeScript(currentTabId, {
            code: "window.getSelection().toString();"
        }, callback);
    } else{
        console.error("Browser not recognized")
    }
}

export function storageGet(key, callback, errorCallback){
    var browserName = queryBrowserName();

    if (browserName=='firefox') {
        mainControl.storage.local.get(key)
            .then(callback);
    }
    else if (browserName=='chrome'){
        mainControl.storage.local.get(key, callback);
    } else{
        console.error("Browser not recognized")
    }
}

export function storageSet(key, callback, errorCallback){
    var browserName = queryBrowserName();

    if (browserName=='firefox') {
        mainControl.storage.local.set({ "openaiKey": key })
        .then(() => {
            console.log("Key stored successfully!");
            createNotification("OpenAI Key successfully Inputted");
        })
        .catch(error => {
            console.error("Error storing key:", error);
            createNotification("OpenAI Key Input Failed");
        });
    }
    else if (browserName=='chrome'){
        mainControl.storage.local.set({ "openaiKey": key });
        console.log("Key stored successfully!");
        createNotification("OpenAI Key successfully Inputted");
    } else{
        console.error("Browser not recognized")
    }
}

export var mainControl = getMainControl()

export function createNotification(message){
    mainControl.notifications.create({
        type: "basic",
        iconUrl: mainControl.extension.getURL("icon64.png"),
        title: "Translation",
        message: message,
    });
};
