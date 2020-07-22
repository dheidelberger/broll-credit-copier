sites.push({
    name: 'StoryBlocks',

    stateMatcher: {
        pageUrl: {
            hostContains: 'storyblocks.com',
            pathContains: 'stock/',
        },
    },

    contentScript: function () {
        var videoblocks = function () {
            var url = window.location.href;
            var title = $('h1').text();

            var buttonText = $('div.downloadMessaging-title').text().trim();

            var fieldObject = {};

            debug('Button says: ' + buttonText);

            if (buttonText === 'Purchase from  Marketplace') {
                fieldObject.status = 'Fail';
                flashWarning(
                    'Stop',
                    ['This clip is not usable'],
                    [
                        "This clip is from the VideoBlocks Marketplace, which means it would need to be purchased separately. Please constrain your search to 'Members-Only Content.'",
                    ],
                    'halt'
                );
            }

            fieldObject.filename = '';
            fieldObject.title = title;
            fieldObject.source = 'StoryBlocks';
            fieldObject.license = 'StoryBlocks';
            fieldObject.credits = 'StoryBlocks';
            fieldObject.url = url;
            message(fieldObject);
        };

        if (url.includes('storyblocks.com')) {
            videoblocks();
        }
    },
});
