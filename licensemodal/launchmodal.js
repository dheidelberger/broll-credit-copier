var agreed = false;

$(document).ready(function() {

    //Agreed is only true if the accept button was clicked
    $('#accept-btn').click(function() {
        agreed = true;
        $('#broll-cc-modal').modal('hide');
    });
    
    //Send a message to background.js that we need to clean up
    $('#broll-cc-modal').on('hidden.bs.modal', function (e) {
        debug(e);
        debug("Hide button pressed");
        // 
        chrome.runtime.sendMessage({messageid:"privacypolicy", agreed:agreed});
    });
    
    $('#broll-cc-modal').modal('show');
});
