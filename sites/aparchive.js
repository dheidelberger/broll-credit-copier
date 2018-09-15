sites.push({

    name: "AP Archive",

    stateMatcher: {
        pageUrl: {
            hostEquals:   'www.aparchive.com',
            pathContains: 'metadata' 
        }    },

    contentScript: function() {
        var aparchive = function() {

            var url = window.location.href;
            var urlSplit = url.split("?");
            url = urlSplit[0];
        
            var title = $("h3[id*='content-slug'").text();
        
            title = title.replace(/^\W*/,"");
        
        
        
            var storyID = $("span[id*='content-storynumber']").text();
            title = title + " ("+storyID+")";
            
            var fieldObject = {};
            fieldObject.filename = "";
            fieldObject.title = title;
            fieldObject.source = "AP";
            fieldObject.licenseGood = "AP";
            fieldObject.credits = "AP";
            fieldObject.url = url;
        
        
            message(fieldObject);
        
        };

        if (url.includes("aparchive.com")) {
            aparchive();
        }
    
    }
});