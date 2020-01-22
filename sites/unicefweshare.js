sites.push({

    name: "Unicef WeShare",

    stateMatcher: {
        pageUrl: {hostContains: 'weshare.unicef.org'},
        css: ["div.PopupC"]

    },

    contentScript: function() {

        getPanelWithID = function(panelID,nameArray) {
            var panel = document.querySelectorAll('div[id*="'+panelID+'"]');

            if (panel.length===0) {
                return;
            }

            let namePanel = panel[0].querySelector('div[id*="ListPnl"]')

            if (namePanel) {
                nameArray.push(namePanel.textContent.trim());
            }
 
        };

        var unicefweshare = function() {
            var fieldObject = {};

            var url = document.querySelectorAll('a[original-title="Permalink"]')[0].getAttribute('href')

            debug(url);

            var titleLine = document.querySelectorAll('div[id*="TitlePnl"]');
            var title = "";

            if (titleLine.length>0) {
                debug("Unicef content has a title");
                title = titleLine[0].lastElementChild.textContent.trim();
            } else {
                debug("Unicef content has no title. Trying identifier.");
                var idLine = document.querySelectorAll('div[id*="IdentifierPnl"]')[0];
                debug(idLine);
                title = idLine.lastElementChild.textContent.trim();
            }

            
            var authors = Array.from(document.querySelectorAll('a[property="author"]')).map(function(x) {
                return x.innerText.trim();
            })
            
            
            //Get editors
            getPanelWithID('KeywordsCustom8Pnl',authors);

            //In House Producer
            getPanelWithID('KeywordsCustom7Pnl',authors);

            //Field Producer
            getPanelWithID('KeywordsCustom6Pnl',authors);

            authors = authors.join("|");

            
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