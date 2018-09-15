sites.push({

    name: "FreeSound",

    stateMatcher: {
        pageUrl: {
            hostContains:   'freesound.org',
            pathContains: '/sounds/'
        }
    },

    contentScript: function() {
        var freeSound = function() {
            var url = window.location.href;
            var title = $("head meta[property='og:audio:title']").attr("content");
            var credit = $("head meta[property='og:audio:artist']").attr("content");
            var license = $("div#sound_license a")[0].href.replace(/http:\/\/creativecommons.org\//g,"").replace(/licenses\//g, "").replace(/\/.*/g,"");
        
            var fieldObject = {};
            fieldObject.filename = "";
            fieldObject.title = title;
            fieldObject.source = "FreeSound";
            fieldObject.license = license;
            fieldObject.credits = credit;
            fieldObject.url = url;
            message(fieldObject);
        };
        
        if (url.includes("freesound.org")) {
            freeSound();
        }
    }
});