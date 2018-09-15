sites.push({

    name: "DVIDS",

    stateMatcher: {
        
            pageUrl: {hostEquals: 'www.dvidshub.net'},
            css: ["h1.asset-title"]
        
    },

    contentScript: function() {
        var dvids = function() {
            var fieldObject = {};
            fieldObject.url = window.location.href;
            fieldObject.title = $("h1.asset-title").text();
            
            //Array of credits. Then join them together with |
            //The credit generator tool knows to split for this character
            var credit = $(".asset_information .uk-width-large-7-10 a:nth-child(1)").map(
                function() {
                    return $(this).text();
                }).get();
        
            fieldObject.credits = credit.join("|");
            fieldObject.filename = "";
            fieldObject.source = "DVIDS";
            fieldObject.license = "DVIDS";
            message(fieldObject);
        };

        if (url.includes("dvidshub.net")) {
            dvids();
        }
    }
});