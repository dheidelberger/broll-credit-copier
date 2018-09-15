sites.push({
    
    name: "Pond5",
    
    stateMatcher: {
        pageUrl: {
            hostContains: 'pond5.com'
        },
        css: ["span.js-addToCartButtonText"]
        
    },
    
    contentScript: function() {
        var pond5MoneyHeader = "Clip costs money";
        var pond5MoneyMessage = "This clip is a pay clip from Pond5. Only Pond5 public domain footage is usable. Please limit your search to the public domain.";
        
        var pond5Search = function(url) {
            var fieldObject = {};
            
            title = JSON.parse($("div.MediaFormats").attr("formats_data")).title;
            var price = Number($("span.js-selectedMediaPrice").text().trim().replace("$",""));
            
            var license = "Public Domain";
            if (price>0) {
                license = "Pond5";
                flashWarning("Stop",[pond5MoneyHeader],[pond5MoneyMessage],"Red");
                fieldObject.status = "Fail";
            }
            
            
            fieldObject.filename = "";
            fieldObject.title = title;
            fieldObject.source = "Pond5";
            fieldObject.license = license;
            fieldObject.credits = "Pond5";
            fieldObject.url = url;
            message(fieldObject);	
            
        };
        
        var pond5Result = function() {
            var fieldObject = {};
            var title = $("h1#itemDetail-mediaTitle span").text().trim();
            var url = window.location.href;
            var price = Number($("span.js-selectedMediaPrice").text().trim().replace("$",""));
            var license = "Public Domain";
            if (price>0) {
                flashWarning("Stop",[pond5MoneyHeader],[pond5MoneyMessage],"Red");
                license = "Pond5";
                fieldObject.status = "Fail";
            }
            
            fieldObject.filename = "";
            fieldObject.title = title;
            fieldObject.source = "Pond5";
            fieldObject.license = license;
            fieldObject.credits = "Pond5";
            fieldObject.url = url;
            message(fieldObject);	
        };
        
        if (url.includes("pond5.com")) {
            pond5Result();
        }
        
    }
});