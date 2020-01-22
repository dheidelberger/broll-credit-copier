sites.push({
    
    name: "European Commission",    
    
    stateMatcher: {
        pageUrl: {
            hostContains: 'ec.europa.eu',
            pathContains: 'video'
        },
        css: ['section.ecl-file--video']
    },
    
    contentScript: function() {
        var europeanCommission = function() {
            var url = window.location.href;
            var title = document.querySelectorAll('div.avs-content-wrapper>h1')[0].innerText.trim()
            var credit = "European Commission"
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