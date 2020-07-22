//Content script for privacy policy
//We open an iframe and the iframe does all the work
//This isolates the css and ensures a consistent look across different sites
//Adapted from https://anderspitman.net/3/#chrome-extension-content-script-stylesheet-isolation/
{
    var iframe = document.createElement('iframe');
    iframe.src = chrome.extension.getURL("licensemodal/modal.html");
    iframe.className = 'b-roll-cc-isolation-popup';
    iframe.frameBorder = 0;
    document.body.appendChild(iframe);

    //The iframe isn't capable of messaging the content script or deleting itself
    //Therefore, the iframe sends a message to background.js 
    //and the background messages the content script which does the cleanup required
    chrome.runtime.onMessage.addListener(function(message) {
        if (message.messageid === "closeprivacypolicy") {
            debug("We must close this thing!");
            iframe.remove();

        }
    });
}