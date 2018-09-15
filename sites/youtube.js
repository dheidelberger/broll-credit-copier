sites.push({

    name: "YouTube",

    stateMatcher: {
        pageUrl: {
            hostEquals:   'www.youtube.com',
            pathContains: 'watch' 
        }
    },

    contentScript: function() {
        var youtube = function() {
            var linkURL = window.location.href;
        
        
            var url = $("a.ytp-title-link").attr("href");
            var id = getParameterByName("v",url);
            var part = "snippet,status,contentDetails";
        
            //youtubeKey variable can be found in apikeys.js. This file is not in version control
            //See readme.md for more details about recreating this file
            var request = "https://www.googleapis.com/youtube/v3/videos?part="+part+"&key="+youtubeKey+"&id="+id;
        
            var xhr = new XMLHttpRequest();
            xhr.timeout = 4000;
        
            var fieldObject = {};
        
            xhr.ontimeout = function () {
                fieldObject = {};
                fieldObject.status = "Fail";
                flashWarning("Error",["Request timed out"],["The request to the YouTube API timed out. Please try again later"],"red");
                message(fieldObject);
            };
        
            xhr.onreadystatechange = function () {
                debug("Status code: "+this.status);
                if (this.readyState == 4 && this.status == 200){
                    fieldObject = {};
                    fieldObject.url = linkURL;
                    fieldObject.filename = "";
        
                    ytinfo  = JSON.parse(this.responseText).items[0];
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
        
        
                } else if (this.readyState == 4 && this.status != 200) {
                    fieldObject = {};
                    fieldObject.status = "Fail";
                    ccLog(this.responseText);
                    var errorMsg = JSON.parse(this.responseText).error.message;
                    flashWarning("Error Code: " +this.status,["YouTube API returned an error"],[errorMsg],"red");
                    message(fieldObject);			
                }
        
            };
        
            xhr.open("GET",request);
            xhr.send();
        
        
        };

        if (url.includes("youtube.com")) {
            youtube();
        }
    }
});