sites.push({
    
    name: "Newscom",
    
    stateMatcher: {
        pageUrl: {
            hostContains:   'newscom.com',
            queryContains:  'searchString='
            
        }
    },
    
    contentScript: function() {
        var newscom = function() {
            var url = window.location.href;
            var searchString = getParameterByName("searchString",url);
            
            var leftURL = url.split("?")[0];
            
            url = leftURL+"?searchString="+searchString;
            
            var title = $("div.displaydetails:contains('Headline')").eq(0).next().text();
            
            var fieldObject = {};
            fieldObject.filename = "";
            fieldObject.title = title;
            fieldObject.source = "Reuters";
            fieldObject.license = "Reuters";
            fieldObject.credits = "Reuters";
            fieldObject.url = url;
            message(fieldObject);
        };
        
        if (url.includes("newscom.com")) {
            newscom();
        }

    }
    
});