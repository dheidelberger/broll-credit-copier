sites.push({
    
    name: "MediaExpress",
    
    stateMatcher: {
        pageUrl: {
            hostContains: 'mediaexpress.reuters.com'
        },
        css: ["div.item-detail"]
    },
    
    contentScript: function() {
        
        //Reuters MediaExpress can have collections of multiple clips
        //The collection has its own id, saved as collectionURL here
        function mediaExpress() {
            var fieldObject = {};
            
            //Is this a multiple clip story?
            var clipCount = parseInt($("li[data-qa-label='clip-count']").attr('data-qa-value'));
            var credit = "Reuters";
            var baseURL = "http://mediaexpress.reuters.com/detail/?id=";
            
            //Convert the tag to a URL that lets us link back to the story
            var collectionTag = encodeURIComponent($("span#selected-item-id").text());
            var collectionURL = "http://mediaexpress.reuters.com/detail/?id=" + collectionTag;
            
            var title = $("div.item-detail h2.headline").text().replace(/(\r\n|\n|\r)/gm," ");
            
            if (clipCount > 1) {
                debug("It's a list of clips");
                
                if (!$('span.package-view-list').hasClass('selected')) {
                    flashWarning("Error",["MediaExpress must be in shotlist mode"],
                    ["This tool cannot properly copy information for multishot MediaExpress clips unless MediaExpress is in Shotlist mode instead of Slideshow mode."],
                    "Red");
                    fieldObject.status = "Fail";
                    message(fieldObject);
                    return null;
                }
                
                
                //Get the URLs for all of the stories on the page
                var urlList = $.map($("div[data-item-id]"), function(x) {
                    var thisURLID = $(x).attr('data-item-id');
                    debug("URL: "+thisURLID);
                    return baseURL+encodeURIComponent(thisURLID);
                });
                
                debug("URL List: "+urlList);
                
                
                //Use the overall title and add the first line of the shotlist for each clip
                var titleList = $.map($('div.package-list-item').find('div.story'),function(x,idx){
                    
                    return title+" (Clip "+(idx+1)+"): "+$(x).find('p')[0].textContent.replace(/(\r\n|\n|\r)/gm,"");
                });
                
                debug("Title List: "+titleList);
                
                //Get restrictions, if any, for each clip
                var licenseList = $.map($("div.left li.restrictions"),function(x) {
                    var thisRestriction = $(x).attr("data-qa-value").replace(/(\r\n|\n|\r)/gm,"");
                    return "RESTRICTIONS: "+thisRestriction;
                    
                });
                
                //If expectArray is true, the processing script in the background knows the content is an array
                //Not every field needs to be an array, though. Scalar fields will be repeated on each line
                //The background script knows automatically to handle scalar and array fields properly as long as expectArray is true.
                fieldObject.filename = "";
                fieldObject.title = titleList;
                fieldObject.source = "Collection link: "+collectionURL;
                fieldObject.license = licenseList;
                fieldObject.credits = credit;
                fieldObject.url = urlList;
                fieldObject.expectArray = true;
                
                showSelectionModal(fieldObject);
                
            } else { //Just a single shot
                debug("It's a single shot");
                var idLink = $('div.fp-playlist a').attr('href');
                var idArray = idLink.match(/content\/(.*)\//); 
                var fullID = idArray[1];
                var restrictions = $("div.right li.restrictions").attr("data-qa-value").replace(/(\r\n|\n|\r)/gm,"");
                var license = "RESTRICTIONS: "+restrictions;
                var myTag = encodeURIComponent(fullID);
                var url = baseURL + myTag;
                
                fieldObject.filename = "";
                fieldObject.title = title;
                fieldObject.source = "Reuters MediaExpress";
                fieldObject.license = license;
                fieldObject.credits = credit;
                fieldObject.url = url;
                message(fieldObject);	
                
            }
        }
        
        if (url.includes("mediaexpress.reuters.com")) {
            mediaExpress();
        }
    }
});