function createNotification(message){
    browser.notifications.create({
        type: "basic",
        iconUrl: browser.extension.getURL("icons/icon48.png"),
        title: "Translation",
        message: message,
    });
};
