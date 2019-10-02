sites.push({

    name: "Unicef WeShare",

    stateMatcher: {
        pageUrl: {hostContains: 'weshare.unicef.org'},
        css: ["div.PopupC"]

    },

    contentScript: function() {
        var unicefweshare = function() {
            var fieldObject = {};

            var url = document.getElementById('a8.3.1.1.1.3:SEOUrlPnl').getElementsByTagName('a')[0].href;
            
            var title = document.getElementById('a8.3.1.1.1.5:Title');
            
            if (title) {
                title = title.innerText.trim();
            } else {
                title = document.getElementById('a8.3.1.1.1.5:Identifier').innerText.trim();
            }

            

            var authors = Array.from(document.querySelectorAll('a[property="author"]')).map(function(x) {
                return x.innerText.trim();
            }).join("|");
            
            var credit = "UNICEF";
            if (authors.length>0) {
                credit = credit + "|" + authors;
            }

        
        
            fieldObject.filename = "";
            fieldObject.title = title;
            fieldObject.source = "UNICEF";
            fieldObject.license = 'UNICEF';
            fieldObject.credits = credit;
            fieldObject.url = url;
            message(fieldObject);	
        
        };

        if (url.includes("weshare.unicef.org")) {
            unicefweshare();
        }
    }
});