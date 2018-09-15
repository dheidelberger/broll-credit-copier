sites.push({
    
    name: "AP Images",
    
    stateMatcher: {
        pageUrl: {
            hostContains:   'apimages.com',
            pathContains: 'metadata' 
        }
    },
    
    contentScript: function() {
        var apimages = function() {
            var url = window.location.href;
            var title = $("div.ltNvPnl h1").text();
            var storyID = $("table.dnmkTbl tr:contains('ID:') td").eq(1).text().trim();
            
            title = title + " ("+storyID+")";
            
            var credit = $("table.dnmkTbl tr:contains('Photographer:') td").eq(1).text().trim();
            
            
            var fieldObject = {};
            fieldObject.filename = "";
            fieldObject.title = title;
            fieldObject.source = "AP";
            fieldObject.license = "AP";
            fieldObject.credits = "AP|"+credit;
            fieldObject.url = url;
            
            message(fieldObject);
            
        };
        
        
        if (url.includes("apimages.com")) {
            apimages();
        }
    }
});