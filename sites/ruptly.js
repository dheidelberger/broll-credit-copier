sites.push({
    
    name: "Ruptly",
    
    stateMatcher: {
        pageUrl: {
            hostContains: 'ruptly.tv',
            pathContains: '/vod/'
        }
    },
    
    contentScript: function() {
        var ruptly = function() {
            var fieldObject = {};
            var url = window.location.href;
            var title = $('h1.ng-binding').text().trim();
            var restrictions = $('dt:contains("Restrictions:")')[0].nextSibling.nextSibling.innerText.trim();
            var license = "Ruptly";
            if (restrictions != "") {
                license = "Restrictions: "+restrictions;
            }
            var credit = "Ruptly";
            
            var signupText = $('li.ng-hide').text().trim();
            
            if (signupText != "Sign upLog In") {
                flashWarning("Warning",
                ["You are not logged in"],
                ["While this tool will still work if you're not logged in to Ruptly, it has no way of warning you whether or not the content is free to use or pay content. Please consider logging in."]);		
                fieldObject.status = "Warning";
            }
            
            //This is pay content
            if ($("button:contains('Calculate the price and buy')").length != 0) {
                flashWarning("Warning",
                ["This clip is a pay clip"],
                ["This clip is pay content from Ruptly. It is not part of Ruptly's pool and free footage."]
                );
                fieldObject.status = "Warning";
            }
            
            
            fieldObject.filename = "";
            fieldObject.title = title;
            fieldObject.source = "Ruptly";
            fieldObject.license = license;
            fieldObject.credits = credit;
            fieldObject.url = url;
            message(fieldObject);	
            
        };
        
        if (url.includes("ruptly.tv")) {
            ruptly();
        }
    }
});