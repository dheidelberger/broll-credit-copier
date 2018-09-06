//Collection of constant strings

var sdHeader = "This content is only available in standard definition";
var sdMessage = "Where possible, please only use HD content. Unless this clip is indispensible, consider looking for an alternative.";
var noCreditHeader = "Credit is missing";
var noCreditMessage = "There doesn't appear to be a credit listed for this video. It is important to be sure that a credit is attached to every clip. Please enter it manually.";
var copyrightHeader = "This clip does not have a Creative Commons License";
var copyrightMessage = "Generally, only Creative Commons-licensed footage is usable. There are exceptions to this rule. The White House YouTube channel, for example, improperly posts their clips with a Standard YouTube License. Please be sure to add a note in the spreadsheet why this clip is an exception to the Creative Commons rule.";
var pond5MoneyHeader = "Clip costs money";
var pond5MoneyMessage = "This clip is a pay clip from Pond5. Only Pond5 public domain footage is usable. Please limit your search to the public domain.";
var reutersConnectHeader = "This clip requires a different Reuters subscription";
var reutersConnectMessage = "This clip requires a Reuters \"Points\" subscription, which we don't have access to. Unfortunately, we will not be able to use this clip.";

function closeWarning() {

    try {
        $("#creditCopy_modal").plainModal('close');
        $("#creditCopy_modal").remove();
        $(".plainmodal-overlay").remove();  
    } catch (err) {
        debug("Couldn't close");
        debug(err);
    }
    
}

//Flashes up a box with warning info about a clip.
//Proper time to call this is after the clip has been processed
//h1 should be the header of the box. Usually, this is just "Warning"
//heading is an array of h3 headers for the various warnings you may have
//message is an array of p explanatory text for each warning
//Type should be blank for a yellow warning or any other value for a red warning
function flashWarning(h1,heading, message,type) {   
    
    color_class = "gdcc-warning";
    if (type!=undefined) {
        color_class = "gdcc-halt";
    }

    //Store the errors in a global variable if we're in testing mode
    if (testingMode) {
        pageErrors = {
            'class': color_class,
            'errs': []
        };
    }

    msg = "<h1 class='"+color_class+"'>"+h1+"</h1>";
    for (var m in message) {
        msg = msg + "<h3 class='"+color_class+"'>" + heading[m] + "</h3>"+"<p class='"+color_class+"'>"+message[m]+"</p>";
        if (testingMode) {
            pageErrors.errs.push(heading[m]);
        }
    }

    msg = msg + "</div>";

    closeWarning();

    $("body").prepend("<div id='creditCopy_modal' class='"+color_class+"'><div class='creditCopy_plainmodal-close "+color_class+"'></div>"+msg);
    
    $('#creditCopy_modal').plainModal('open', {
        closeClass:     'creditCopy_plainmodal-close'
    });

}

//This function allows you to select a clip from a modal window
//usrLabelField is what field to put in the select dropdown. If null, will use numbers
function showSelectionModal(fieldObject,usrLabelField) {
    var labelField = usrLabelField || null;
    debug("Gonna show the modal");
    debug("Label field is: "+labelField);
    var msg = "<h1>There are multiple clips listed</h1>";
    msg = msg + "<h3>Please select which you want to copy:</h3>";
    msg = msg + '<select id="selection-list" name="selection-list">';

    var optionList = "<option selected='selected' value='-1'>All Clips (Multiple Lines)</option>";

    for (var i = 0; i<fieldObject.url.length; i++) {
        var thisLabel = "Clip "+(i+1);

        if (labelField !== null) {
            thisLabel = fieldObject[labelField][i];
        }


        optionList += "<option value='"+i+"'>"+thisLabel+"</option>";

    }

    msg = msg + optionList +"</select>";
    msg = msg + '<div><button type="button" id="list-selection-button" class="selection-button">Select</button></div></div>';
    
    closeWarning();

    $("body").prepend("<div id='creditCopy_modal'><div class='creditCopy_plainmodal-close'></div>"+msg);

    //This is hack-y, but it seems to work
    //The select button is going to close the modal, but that triggers a cancel action in the close handler
    //This variable tells the close handler not to send a message to the bg script, we'll handle it normally
    //   as a success or failure
    var treatCloseAsCancel = true;

    $('#creditCopy_modal').plainModal('open', {
        closeClass:     'creditCopy_plainmodal-close',
        close: function(event) {
            debug(event);
            $("#creditCopy_modal").remove();

            if (treatCloseAsCancel) {
                chrome.runtime.sendMessage({fields: "Cancel"}); 
            }
            

        }, 
        open: function(event) {
            debug("Window opened");
            //var theButton = $('#list-selection-button')[0];
            //debug(theButton);
            $('#list-selection-button')[0].onclick = function(){
                var selectedClip = parseInt($('#selection-list').find(":selected").attr("value"));

                if (selectedClip === -1) {
                    fieldObject.expectArray = true;
                    message(fieldObject);
                } else {
                    var singleFieldObject = {};
                    singleFieldObject.filename = getValAtIndex(fieldObject.filename,selectedClip);
                    singleFieldObject.title = getValAtIndex(fieldObject.title,selectedClip);
                    singleFieldObject.source = getValAtIndex(fieldObject.source,selectedClip);
                    singleFieldObject.license = getValAtIndex(fieldObject.license,selectedClip);
                    singleFieldObject.credits = getValAtIndex(fieldObject.credits,selectedClip);
                    singleFieldObject.url = getValAtIndex(fieldObject.url,selectedClip);
                    singleFieldObject.expectArray = false;
                    message(singleFieldObject);
                }

                treatCloseAsCancel = false;
                closeWarning();
            };

        }
    }); 


}