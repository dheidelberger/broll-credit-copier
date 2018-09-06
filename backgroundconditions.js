/*
By moving these out of the background.js file, we can eventually write tests for these conditions
*/

var matchConditions = {
    dvids: {
        pageUrl: {hostEquals: 'www.dvidshub.net'},
        css: ["h1.asset-title"]
    },
    youtube: {
        pageUrl: {
            hostEquals:   'www.youtube.com',
            pathContains: 'watch' 
        }
    },
    vimeo: {
        pageUrl: {
            hostContains:   'vimeo.com',
        },
        css: ['div.player_area']
        
    },
    aparchive: {
        pageUrl: {
            hostEquals:   'www.aparchive.com',
            pathContains: 'metadata' 
        }
        
    },
    apimages: {
        pageUrl: {
            hostContains:   'apimages.com',
            pathContains: 'metadata' 
        }
        
    },
    newscom:{
        pageUrl: {
            hostContains:   'newscom.com',
            queryContains:  'searchString='
            
        }
        
    },
    videoblocks: {
        pageUrl: {
            hostContains:   'videoblocks.com',
            pathContains: 'video/' 
        }
        
    },
    unifeed:{
        pageUrl: {
            hostContains:   'unmultimedia.org',
            pathContains: 'tv/unifeed/asset' 
        }
        
    },
    flickr: {
        pageUrl: {
            hostContains:   'flickr.com',
            pathContains: 'photos/' 
        }
        
    },
    freesound:{
        pageUrl: {
            hostContains:   'freesound.org',
            pathContains: '/sounds/'
        }
        
    },
    pond5:{
        pageUrl: {
            hostContains: 'pond5.com'
        },
        css: ["span.js-addToCartButtonText"]
    },
    mediaexpress: {
        pageUrl: {
            hostContains: 'mediaexpress.reuters.com'
        },
        css: ["div.item-detail"]
        
    },
    reutersconnect: {
        pageUrl: {
            hostContains: 'reutersconnect.com'
        },
        css: ["div.item-detail"]
        
    },
    ec: {
        pageUrl: {
            hostContains: 'ec.europa.eu',
            queryContains: '&ref=',
            pathContains: 'avservices'
        }
        
        
    },
    newsmarket:{
        pageUrl: {
            hostContains: 'thenewsmarket.com'
            //pathContains: '/global/all/video-images-audio/',
        },
        css: ["div.images-videos-detail-page"]
    },
    ruptly:{
        pageUrl: {
            hostContains: 'ruptly.tv',
            pathContains: '/vod/'
        }
    }
};