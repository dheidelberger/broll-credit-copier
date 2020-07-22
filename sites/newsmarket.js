sites.push({
    name: 'Newsmarket',

    stateMatcher: {
        pageUrl: {
            hostContains: 'thenewsmarket.com',
        },
        css: ['div.playkit-video-player'],
    },

    contentScript: function () {
        var newsmarket = function () {
            var title = $('h2.amp-title').text().trim();

            var credits =
                $('h5.amp-brand-name').first().text().trim() +
                '|The NewsMarket';
            var license = document
                .querySelectorAll('li.ampUsageRights span')[0]
                .textContent.trim();
            var url = window.location.href;

            var fieldObject = {};
            fieldObject.filename = '';
            fieldObject.title = title;
            fieldObject.source = 'The NewsMarket';
            fieldObject.license = license;
            fieldObject.credits = credits;
            fieldObject.url = url;
            message(fieldObject);
        };

        if (url.includes('thenewsmarket.com')) {
            newsmarket();
        }
    },
});
