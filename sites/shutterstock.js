sites.push({

    name: "Shutterstock",

    stateMatcher: [
       
        // Editorial Image content
        {
            pageUrl: {
                hostContains: 'shutterstock.com',
                pathContains: '/image-'
            },
            css: ['div.asset__media']
        },
        // Regular Image content
        {
            pageUrl: {
                hostContains: 'shutterstock.com',
                pathContains: '/image-'
            },
            css: ['button[data-automation="heroActions_try"]']
        },
        // Music content
        {
            pageUrl: {
                hostContains: 'shutterstock.com',
                pathContains: '/music/'
            },
            css: ['div[data-automation="PageTrackDetails_root_container"]']
        },
        //Footage content
        {
            pageUrl: {
                hostContains: 'shutterstock.com',
                pathContains: '/video/'
            },
            css: ['div[data-automation="PageClipDetails_root_container"]']
        }
    ],

    contentScript: function() {

        //Nice site list:
        //https://www.shutterstock.com/editorial/image-editorial/26th-annual-screen-actors-guild-awards-arrivals-shrine-auditorium-los-angeles-usa-19-jan-2020-10525969eu
        //https://www.shutterstock.com/editorial/image-editorial/baseballtigres-de-licey-toros-del-este-santo-domingo-dominican-republic-22-jan-2020-10532399b
        // https://www.shutterstock.com/editorial/image-editorial/champions-lpga-golf-lake-buena-vista-usa-19-jan-2020-10530365j
        // https://www.shutterstock.com/editorial/image-editorial/historical-collection-10276441a
        // https://www.shutterstock.com/image-photo/paris-eiffel-tower-river-seine-sunset-710380270
        // https://www.shutterstock.com/image-photo/woman-tourist-selfie-near-eiffel-tower-519799885
        // https://www.shutterstock.com/image-photo/baseball-player-throws-ball-on-professional-1131760214
        // https://www.shutterstock.com/image-vector/baseball-lace-ball-illustration-isolated-symbol-1234666114
        // https://www.shutterstock.com/music/track-430391-chains
        // https://www.shutterstock.com/music/track-487262-rock-party
        // https://www.shutterstock.com/music/track-424175-le-chat-gourmand
        // https://www.shutterstock.com/music/track-394715-tough-job
        // https://www.shutterstock.com/video/clip-1019087425-portrait-young-millennial-asian-woman-long-hair
        // https://www.shutterstock.com/video/clip-1039297553-los-angeles--california-united-states--
        // https://www.shutterstock.com/video/clip-32407198-1950s-baseball-players-play-game-football
        // https://www.shutterstock.com/video/clip-1010432156-millennial-vlogger-influencer-wearing-baseball-cap-backwards
        



        //Thanks! https://stackoverflow.com/a/58364891/6562951
        var getNodesContainingText = function(selector, text) {
            const elements = [...document.querySelectorAll(selector)];
        
            return elements.filter(
              (element) =>
                element.childNodes[0] && element.childNodes[0].nodeValue && RegExp(text, "u").test(element.childNodes[0].nodeValue.trim())
            );
        };

        var shutterstockEditorial = function(fieldObject) {
            
            fieldObject.title = document.querySelectorAll('span.title')[0].textContent.trim();

            let credits = getNodesContainingText('ul.asset__summary__meta>li','Editorial credit:');
            if (credits.length>0) {
                fieldObject.credits = credits[0].querySelector('span').textContent.trim();
            } else {
                fieldObject.credits = "Unknown Shutterstock";
            }

            fieldObject.source = "Shutterstock Editorial";
            fieldObject.license = "Editorial use only";

            message(fieldObject);
        };

        var shutterstockImage = function(fieldObject) {
            fieldObject.title = document.querySelectorAll('h1.font-headline-base')[0].textContent.trim();
            fieldObject.credits = document.querySelector('a[data-track-label="contributorLink"]').textContent.trim();
            fieldObject.source = "Shutterstock Images";

            let license = "Shutterstock";

            let release = document.querySelectorAll('div.m_h_a');

            if (release.length>0) {
                license = license+". "+release[0].textContent.trim();
            }

            fieldObject.license = license;

            message(fieldObject);
        };

        var shutterstockMusic = function(fieldObject) {
            fieldObject.title = document.querySelector('h1[data-automation="PageTrackDetails_Track_Title"]').textContent.trim();
            fieldObject.credits = document.querySelectorAll('div.oc_u_a a')[0].textContent.trim();
            fieldObject.source = "Shutterstock Music";

            let license = "Shutterstock Royalty-Free Music";

            if (document.body.textContent.includes('PRO free')) {
                license = license + ". PRO free: This track is not registered with performance rights organisations.";
            }

            fieldObject.license = license;

            message(fieldObject);
        };

        var shutterstockFootage = function(fieldObject) {
           fieldObject.title = document.querySelector('h1.l_j_e').textContent.trim();
           fieldObject.credits =  document.querySelectorAll('div.oc_u_a a')[0].textContent.trim();
           fieldObject.source = "Shutterstock Footage";
           fieldObject.license = document.querySelector('span[data-automation="ClipDetails_License_text"]').textContent.trim();

           message(fieldObject);

        };

        if (url.includes("shutterstock")) {
            var fieldObject = {};
            fieldObject.url = window.location.href;
            fieldObject.filename = "";

            if (document.querySelector('div.asset__media')) {
                //Editorial
                shutterstockEditorial(fieldObject);

            } else if (document.querySelector('button[data-automation="heroActions_try"]')) {
                //Image
                shutterstockImage(fieldObject);

            } else if (document.querySelector('div[data-automation="PageTrackDetails_root_container"]')) {
                //Music
                shutterstockMusic(fieldObject);

            } else if (document.querySelector('div[data-automation="PageClipDetails_root_container"]')) {
                //Footage
                shutterstockFootage(fieldObject);
            }


        }



    }
});