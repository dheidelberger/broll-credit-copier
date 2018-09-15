sites.push({
    
    name: "Unifeed",
    
    stateMatcher: {
        pageUrl: {
            hostContains:   'unmultimedia.org',
            pathContains: 'tv/unifeed/asset' 
        }
    },
    
    contentScript: function() {
        var unifeed = function() {
            var url = window.location.href;
            var title = $("h1.page-header").text();
            var credit = $("div.multimedia_asset_node_field_title:contains('Source')").next().text().trim();
            
            //Seems to be less reliable than the new method below
            //var file = $("div.multimedia_asset_node_field_title:contains('Alternate Title')").next().text().trim();
            
            var file = $("meta[property='og:image']").attr('content').split("/").pop().split(".")[0];
            
            var fieldObject = {};
            fieldObject.filename = file;
            fieldObject.title = title;
            fieldObject.source = "Unifeed";
            fieldObject.license = "Unifeed";
            fieldObject.credits = credit;
            fieldObject.url = url;
            message(fieldObject);
            
        };

        if (url.includes("unmultimedia.org")) {
            unifeed();
        }
    }
});