sites.push({

    name: "VideoBlocks",

    stateMatcher: {
        pageUrl: {
            hostContains:   'videoblocks.com',
            pathContains: 'video/' 
        }
    },

    contentScript: function() {
        var videoblocks = function() {	
            var url = window.location.href;
            var title = $("h1").text();
        
            var buttonText = $('div.downloadMessaging-title').text().trim()
            
            //


            var fieldObject = {};
        
            debug("Button says: "+buttonText);
        
            if (buttonText === "Purchase from  Marketplace") {
                fieldObject.status = "Fail";
                flashWarning("Stop",["This clip is not usable"],["This clip is from the VideoBlocks Marketplace, which means it would need to be purchased separately. Please constrain your search to 'Members-Only Content.'"],"halt");
            }
        
            fieldObject.filename = "";
            fieldObject.title = title;
            fieldObject.source = "VideoBlocks";
            fieldObject.license = "VideoBlocks";
            fieldObject.credits = "VideoBlocks";
            fieldObject.url = url;
            message(fieldObject);
            
        };
        
        if (url.includes("videoblocks.com")) {
            videoblocks();
        }
    }
});