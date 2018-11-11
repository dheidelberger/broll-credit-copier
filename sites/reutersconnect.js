sites.push({
    
    name: "Reuters Connect",
    
    stateMatcher: {
        pageUrl: {
            hostContains: 'reutersconnect.com'
        },
        css: ["div.item-detail"]
    },
    
    contentScript: function() {
        var reutersConnectHeader = "This clip requires a different Reuters subscription";
        var reutersConnectMessage = "This clip requires a Reuters \"Points\" subscription, which we don't have access to. Unfortunately, we will not be able to use this clip.";
        
        //Reuters Connect. Replacement for MediaExpress, and very similar page structure.
        var reutersConnect = function() {
            
            
            
            
            var fieldObject = {};
            var credit = "Reuters";
            
            //Check if this is points-based. If so, it's not part of our subscription.
            var pointValue = $('div[data-qa-component=points-button] span').attr('data-qa-value');
            
            //We can't use this clip
            if (pointValue !== "0") {
                flashWarning("Warning",[reutersConnectHeader], 
                [reutersConnectMessage],
                "Red");
                fieldObject.status = "Fail";
            }
            
            //https://www.reutersconnect.com/all?id=tag%3Areuters.com%2C2018%3Anewsml_LVA0038MX2ERD%3A1&
            
            //Convert the tag to a URL that lets us link back to the story
            var videoTag = encodeURIComponent($("span#selected-item-id").text());
            var videoURL = "https://www.reutersconnect.com/all?share=true&id=" + videoTag;	
            
            var thumbs = $('div.item-detail').find('div.py15');
            
            var shotCount = thumbs.children().length;



            
            //Get the title
            var title = $("div.item-detail h2[data-qa-component='item-headline").text().replace(/(\r\n|\n|\r)/gm," ");
            
            var restrictions = $("span[data-qa-component='meta-data-story-restrictions-value']").text().replace(/(\r\n|\n|\r)/gm,"");
            var license = "RESTRICTIONS: "+restrictions;
            

            fieldObject.filename = "";
            fieldObject.license = license;
            fieldObject.credits = credit;

            if (shotCount>1) {
                debug("More than one:" +shotCount);
                var options = {includeSelectAll: false};

                var titles = [];               
                var sources = [];
                var urls = []; 

                for (var i = 0; i<shotCount; i++) {
                    debug("Adding: "+i);
                    sources.push("Reuters Connect: Shot "+(i+1));
                    urls.push(videoURL+"&shotNumber="+(i+1));
                    titles.push(title+" - Shot "+(i+1));
    
                }
                debug(sources);
                debug(urls);
                fieldObject.source = sources;
                fieldObject.url = urls;
                fieldObject.title = titles;

                showSelectionModal(fieldObject,options);

            } else {
                fieldObject.source = "Reuters Connect";
                fieldObject.url = videoURL;
                fieldObject.title = title;

                message(fieldObject);

            }
            

            
        };
        
        if (url.includes("reutersconnect.com")) {
            reutersConnect();
        }
    }
    
});