sites.push({

    name: "Flickr",

    stateMatcher: {
        pageUrl: {
            hostContains:   'flickr.com',
            pathContains: 'photos/' 
        }
    },

    contentScript: function() {
        var flickr = function() {
            var fieldObject = {};
        
            var url = $("head meta[property='og:url']").attr("content");
            var title = $("head meta[property='og:title']").attr("content");
            var licenseIcon = $("div.photo-license-info a i").first().attr("class");
        
            var licenseNumber = parseInt(licenseIcon.replace(/ui-icon-tiny-/g, "").replace(/cc/g,""));
        
            debug(licenseIcon);
            debug(licenseNumber);
        
            var license = "";
        
            switch(licenseNumber) {
                case 0:
                    license = "COPYRIGHTED";
                    break;
                case 1:
                    license = "BY-NC-SA";
                    break;
                case 2:
                    license = "BY-NC";
                    break;
                case 3:
                    license = "BY-NC-ND";
                    break;
                case 4:
                    license = "BY";
                    break;
                case 5:
                    license = "BY-SA";
                    break;
                case 6:
                    license = "BY-ND";
                    break;
                case 8: //PD Gvt
                    license = "Public Domain (Government)";
                    break;
                case 9: //PD0
                    license = "Public Dommain (CC0)";
                    break;
                case 10: //	PD mark
                    license = "Public Domain (Marked as)";
                    break;
                default:
                    license = "Unkown";
            }
        
            var credit = $("div.attribution-info a.owner-name").first().text();
            
            if (license == "COPYRIGHTED") {
                fieldObject.status = "Warning";
                flashWarning("Warning",[copyrightHeader],[copyrightMessage]);
            }
        
            fieldObject.filename = "";
            fieldObject.title = title;
            fieldObject.source = "Flickr";
            fieldObject.license = license;
            fieldObject.credits = credit;
            fieldObject.url = url;
            message(fieldObject);	
        
        };

        if (url.includes("flickr.com")) {
            flickr();
        }
    }
});