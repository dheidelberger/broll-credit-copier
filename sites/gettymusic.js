sites.push({

    name: "Getty Music",

    stateMatcher: [
        // Individual track page
        {
            pageUrl: {
                hostContains: 'gettyimages.com',
                pathContains: 'download-songs'
            }        },
        
        //Tracklist page, 'music' in path is with a lowercase 'm'
        {
            pageUrl: {
                hostContains: 'gettyimages.com',
                pathContains: 'music'
            },
            css: ['div.track-row-container.expanded']
        },
        //Tracklist page, 'music' in path is with a capital 'M'
        {
            pageUrl: {
                hostContains: 'gettyimages.com',
                pathContains: 'Music'
            },
            css: ['div.track-row-container.expanded']
        },

    ],

    contentScript: function() {


        var gettyMusicTrackPage = function(myDocument,docURL) {
            var fieldObject = {};
            fieldObject.url = docURL;
            
            
            
            fieldObject.title = myDocument.querySelectorAll('meta[itemprop="name"]')[0].getAttribute("content").trim();
            fieldObject.credits = myDocument.querySelectorAll('meta[itemprop="author"]')[0].getAttribute("content").trim();
            fieldObject.source = "Getty Music";

            fieldObject.license = myDocument.querySelector('div.rights-tag+span').innerText.trim();
            fieldObject.filename = "";

            message(fieldObject);
        };

        var gettyMusicTrackList = function() {

            let expandedContainer = document.querySelector('div.track-row-container.expanded');
            let detailURL = 'https://www.gettyimages.com'+ expandedContainer.querySelector('.track-row').getAttribute('data-adp-url')


            fetch(detailURL)
            .then(response => response.text())
            .then(text => {
                const parser = new DOMParser();
                const htmlDocument = parser.parseFromString(text, "text/html");
                gettyMusicTrackPage(htmlDocument,detailURL);
                
            })

        }



        if (url.includes("gettyimages") && url.includes("download-songs")) {
            debug("We're on a track page");
            
            gettyMusicTrackPage(document,window.location.href);
        } else if (url.includes("gettyimages")) {
            debug("We're on a list");
            
            gettyMusicTrackList();
        }
    }
});