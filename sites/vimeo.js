sites.push({

    name: "Vimeo",

    stateMatcher: {
        pageUrl: {
            hostContains:   'vimeo.com',
        },
        css: ['div.player_area']        
    },

    listener: function(message, sender, sendResponse) {
        if (message.messageid === "vimeo") {
            var vidID = message.vidID;
            var request = "https://api.vimeo.com/videos/"+vidID+"?"+"fields=name,license,height,width,link,user.name";

            var xhr = new XMLHttpRequest();
            xhr.timeout = 4000;

            var response = {};

            xhr.ontimeout = function () {
                response.returnMessage="timeout";
                sendResponse(response);
            };
            xhr.onreadystatechange = function () {
                debug("Status code: "+this.status);
                if (this.readyState == 4 && this.status == 200){ 
                    response.returnMessage="success";
                    response.responseText = this.responseText;
                    sendResponse(response);
                } else if (this.readyState == 4 && this.status != 200) {
                    response.returnMessage = "fail";
                    response.responseText = this.responseText;
                    response.status = this.status;
                    
                    sendResponse(response);
                }
            

            };

            xhr.open("GET",request);
            xhr.setRequestHeader("Authorization",vimeoKey);
            xhr.send();

            return true;



        }




    },

    contentScript: function() {
        //Helper method to see if a Vimeo clip is properly licensed
        var goodLicense = function(license) {
            var goodLicenses = ["by","by-nc","by-nc-nd","by-nc-sa","by-nd","by-sa","cc0"];

            var licenseFound = goodLicenses.indexOf(license);

            return (licenseFound > -1);

        };

        //Helper method to check for HD. We look in either the x or y direction
        var goodSize = function(height,width){
            var myHeight = parseInt(height);
            var myWidth = parseInt(width);

            return ((myHeight >= 720) || (myWidth >= 1280));
        };

        var vimeo = function() {
            var fieldObject = {};

            var isPrivate = $('span[title="Private Link"]').length > 0;
            var hasError = false;

            if (isPrivate) {
                flashWarning("Warning",["Private Video"], 
                    ["This is a private Vimeo video. While it may be usable, unfortunately, due to limitations in the Vimeo API, Credit Copier is unable to read the metadata for this video."],
                    "Red");
                fieldObject.status = "Fail";
                message(fieldObject);
                return;

            }

            var vidID = $(".player_container").attr("id").replace("clip_","").trim();

            debug("ID: "+vidID);

            chrome.runtime.sendMessage({vidID:vidID,messageid:"vimeo"},function(response) {
                debug("Got response");
                debug(response);
                if (response.returnMessage === "timeout") {
                    fieldObject.status = "Fail";
                    flashWarning("Error",["Request timed out"],["The request to the Vimeo API timed out. Please try again later"],"red");
                    message(fieldObject);

                }

                if (response.returnMessage==="success") {


                    vimeoData = response.responseText;
        
                    // debug(this.responseText);
                    // debug(this.getAllResponseHeaders());
                    
        
                    var vimObject = JSON.parse(vimeoData);
        
                    var vim = {};
                    vim.id = vidID;
                    vim.link = vimObject.link;
                    vim.title = vimObject.name;
                    vim.credit = vimObject.user.name;
                    vim.license = vimObject.license;
                    vim.height = vimObject.height;
                    vim.width = vimObject.width;
        
                    needWarning = false;
                    warningHdr = [];
                    warningMsg = [];
        
        
                    var licenseGood = goodLicense(vim.license);
                    if (!licenseGood) {
                        vim.license = "COPYRIGHTED";
                        needWarning = true;
                        warningHdr.push(copyrightHeader);
                        warningMsg.push(copyrightMessage);
                    }
        
                    
                    var sizeGood = goodSize(vim.height,vim.width);
                    if (!sizeGood) {
                        needWarning = true;
                        warningHdr.push(sdHeader);
                        warningMsg.push(sdMessage);
                    }
        
                    if (needWarning) {
                        flashWarning("Warning",warningHdr,warningMsg);
                        fieldObject.status = "Warning";
        
        
                    }
        
                    fieldObject.filename = "";
                    fieldObject.title = vim.title;
                    fieldObject.source = "Vimeo";
                    fieldObject.license = vim.license;
                    fieldObject.credits = vim.credit;
                    fieldObject.url = vim.link;
                    message(fieldObject);	
                }

                if (response.returnMessage==="fail") {
                    fieldObject.status = "Fail";
                    ccLog(response.responseText);
                    var errorMsg = JSON.parse(response.responseText).error;
                    flashWarning("Error Code: " +response.status,["Vimeo API returned an error"],[errorMsg],"red");
                    message(fieldObject);		
                }




            });

        };      

        if (url.includes("vimeo.com")) {
            vimeo();
        }
    }
});