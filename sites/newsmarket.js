sites.push({
    
    name: "Newsmarket",
    
    stateMatcher: {
        pageUrl: {
            hostContains: 'thenewsmarket.com'
        },
        css: ["div.images-videos-detail-page"]
    },
    
    contentScript: function() {
        var newsmarket = function() {
            var title = $("div.title h1").text().trim();
            var credits = $("b:contains('SOURCE:')")[0].nextElementSibling.innerText + "|The NewsMarket";
            var license = $("div.asset-usagerights div.visible-text").text().trim();
            var url = window.location.href;
            
            var fieldObject = {};
            fieldObject.filename = "";
            fieldObject.title = title;
            fieldObject.source = "The NewsMarket";
            fieldObject.license = license;
            fieldObject.credits = credits;
            fieldObject.url = url;
            message(fieldObject);	
            
        };
        
        if (url.includes("thenewsmarket.com")) {
            newsmarket();
        }
    }
});