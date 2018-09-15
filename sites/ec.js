sites.push({
    
    name: "European Commission",
    
    stateMatcher: {
        pageUrl: {
            hostContains: 'ec.europa.eu',
            queryContains: '&ref=',
            pathContains: 'avservices'
        }
    },
    
    contentScript: function() {
        var europeanCommission = function() {
            var url = window.location.href;
            var title = $('h3')[1].innerText.trim();
            var credit = $('span#agency').text().replace(/.*Source: /i,"").trim();
            var license = "EC Handout";
            
            var fieldObject = {};
            fieldObject.filename = "";
            fieldObject.title = title;
            fieldObject.source = "European Commission";
            fieldObject.license = license;
            fieldObject.credits = credit;
            fieldObject.url = url;
            message(fieldObject);	
            
            
            
        };
        
        if (url.includes("ec.europa.eu")) {
            europeanCommission();
        }
    }
});