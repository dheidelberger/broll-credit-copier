sites.push({

    name: "YouTube",

    stateMatcher: {
        pageUrl: {
            hostEquals:   'www.youtube.com',
            pathContains: 'watch' 
        }
    },

    listener: function(message, sender, sendResponse) {
        if (message.messageid === "youtube") {
            var part = "snippet,status,contentDetails";
            debug(sender);
            debug(message);
            //youtubeKey variable can be found in apikeys.js. This file is not in version control
            //See readme.md for more details about recreating this file
            var request = "https://www.googleapis.com/youtube/v3/videos?part="+part+"&key="+youtubeKey+"&id="+message.id;
            var xhr = new XMLHttpRequest();
            xhr.timeout = 4000;

            var response = {};
    
            xhr.ontimeout = function() {
                response.returnMessage="timeout";
                sendResponse(response);
            };
    
            xhr.onreadystatechange = function () {
                debug("Status code: "+this.status);
                if (this.readyState == 4 && this.status == 200){ 
                    response.returnMessage="success";
                    response.ytinfo = this.responseText;
                    sendResponse(response);
    
                } else if (this.readyState == 4 && this.status != 200) {
                    response.returnMessage = "fail";
                    response.responseText = this.responseText;
                    response.status = this.status;
                    
                    sendResponse(response);
                    
    
                }
            };
    
            xhr.open("GET",request);
            xhr.send();

            return true;

        }
    },

    contentScript: function() {
        var youtube = function() {
            var linkURL = window.location.href;
        
        
            var url = $("a.ytp-title-link").attr("href");
            var id = getParameterByName("v",url);
            

            chrome.runtime.sendMessage({id:id,messageid:"youtube"},function(response) {
                debug("Got back a response");
                debug(response);
                var fieldObject = {};
                if (response.returnMessage==="timeout") {
                    fieldObject = {};
                    fieldObject.status = "Fail";
                    flashWarning("Error",["Request timed out"],["The request to the YouTube API timed out. Please try again later"],"red");
                    message(fieldObject);
                }

                if (response.returnMessage==="success") {
                    fieldObject = {};
                    fieldObject.url = linkURL;
                    fieldObject.filename = "";
                    
                    ytinfo  = JSON.parse(response.ytinfo).items[0];
                    debug(ytinfo);
                    fieldObject.title = ytinfo.snippet.title;
                    fieldObject.license = ytinfo.status.license;
                    fieldObject.credits = ytinfo.snippet.channelTitle;
                    var definition = ytinfo.contentDetails.definition;
                    debug("Definition: "+definition);
        
                    needWarning = false;
                    warningHdr = [];
                    warningMsg = [];
        
                    if (definition == "sd") {
                        needWarning = true;
                        warningHdr.push(sdHeader);
                        warningMsg.push(sdMessage);
                        
                    }
        
                    if (fieldObject.license == "youtube") {
                        needWarning = true;
                        warningHdr.push(copyrightHeader);
                        warningMsg.push(copyrightMessage);
        
                    }
        
                    if (needWarning) {
                        fieldObject.status = "Warning";
                        flashWarning("Warning",warningHdr,warningMsg);
        
                    }
        
                    fieldObject.source = "YouTube";
        
        
        
                    message(fieldObject);

                }

                if (response.returnMessage==="fail") {
                    fieldObject = {};
                    fieldObject.status = "Fail";
                    ccLog(response.responseText);
                    var errorMsg = JSON.parse(response.responseText).error.message;
                    flashWarning("Error Code: " +response.status,["YouTube API returned an error"],[errorMsg],"red");
                    message(fieldObject);			

                }

            });
        

        
        
        };

        if (url.includes("youtube.com")) {
            youtube();
        }
    }
});