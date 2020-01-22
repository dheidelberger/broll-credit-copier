sites.push({

    name: "Getty Images",

    stateMatcher: {
        
            pageUrl: {
                hostContains: 'gettyimages.com',
                pathContains: 'detail'
            },
            css: ['.asset-detail-page']
    },

    contentScript: function() {

        var getNextSibling = function (elem, selector) {

            // Get the next sibling element
            var sibling = elem.nextElementSibling;
        
            // If there's no selector, return the first sibling
            if (!selector) return sibling;
        
            // If the sibling matches our selector, use it
            // If not, jump to the next sibling and continue the loop
            while (sibling) {
                if (sibling.matches(selector)) {
                    return sibling;
                }
                sibling = sibling.nextElementSibling;
            }

            return null;
        
        };

        var getMetaInfo = function(classname) {

            
            var parentNode = document.querySelectorAll('div.'+classname)[0];            
            var detailNode = parentNode.querySelector('div.asset-detail__value');            

            if (!detailNode) {                
                detailNode = getNextSibling(parentNode,'.asset-detail__value');
            }            

            if (!detailNode) {
                return "";
            } else {
                return detailNode.innerText.trim();
            }
        };

        var gettyImages = function() {
            var fieldObject = {};
            fieldObject.url = window.location.href.replace("adppopup=true","");
            
            fieldObject.title = $("h1.asset-description__title").text().trim();

            
            fieldObject.credits = getMetaInfo('asset-detail--credit')+"/Getty";
            fieldObject.source = getMetaInfo('asset-detail--collection');
            var license = getMetaInfo('asset-detail--license-type');
            var release = getMetaInfo('asset-detail--release');

            release = release.replace("More information","").trim();
            fieldObject.license = "License: "+license+"/Release: "+release;
            fieldObject.filename = "";
            message(fieldObject);
        };

        var urlLow = url.toLowerCase();

        if (urlLow.includes("gettyimages") && urlLow.includes('detail')) {
            gettyImages();
        }
    }
});