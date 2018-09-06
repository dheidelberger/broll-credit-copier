var inits = "";

var theTab = null;
var enableSounds = null;



//Check for conditions when the button should be enabled:
chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([
    {
        

        conditions: [
        new chrome.declarativeContent.PageStateMatcher(matchConditions.dvids),
        new chrome.declarativeContent.PageStateMatcher(matchConditions.youtube),
        new chrome.declarativeContent.PageStateMatcher(matchConditions.vimeo),
        new chrome.declarativeContent.PageStateMatcher(matchConditions.aparchive),
        new chrome.declarativeContent.PageStateMatcher(matchConditions.apimages),
        new chrome.declarativeContent.PageStateMatcher(matchConditions.newscom),
        new chrome.declarativeContent.PageStateMatcher(matchConditions.videoblocks),
        new chrome.declarativeContent.PageStateMatcher(matchConditions.unifeed),
        new chrome.declarativeContent.PageStateMatcher(matchConditions.flickr),
        new chrome.declarativeContent.PageStateMatcher(matchConditions.freesound),
        new chrome.declarativeContent.PageStateMatcher(matchConditions.pond5),
        new chrome.declarativeContent.PageStateMatcher(matchConditions.mediaexpress),
        new chrome.declarativeContent.PageStateMatcher(matchConditions.reutersconnect),
        new chrome.declarativeContent.PageStateMatcher(matchConditions.ec),
        new chrome.declarativeContent.PageStateMatcher(matchConditions.newsmarket),
        new chrome.declarativeContent.PageStateMatcher(matchConditions.ruptly)
        ],
        // And shows the extension's page action.
        actions: [ new chrome.declarativeContent.ShowPageAction() ]
      }
      ]);
  });
});

function playSound(filename) {
  if (enableSounds) {
    var myAudio = new Audio();
    myAudio.src = "sounds/"+filename+".mp3";
    myAudio.play();     
    
  }
}

chrome.runtime.onMessage.addListener(
  function(request, sender) {

    

    //Arr is actually an object. Probably should refactor sometime...
    var arr = request.fields;

    if (arr === "Cancel") {
      debug("User canceled a modal");
      setupAnimation("Static");
      return;

    }

    arr.notes = "";
    arr.inits = inits;

    setupAnimation(arr.status,true);
    playSound(arr.status);



    debug(arr);
    var dat = tabbize(arr);

    //Cheaty hidden input so we can get data to clipboard.
    var input = document.createElement('textarea');
    document.body.appendChild(input);
    input.value = dat;
    input.focus();
    input.select();
    document.execCommand('Copy');
    input.remove();
});

//Push all the values into a row
function makeRow(fieldObject,i) {
  var thisRow = [];
  thisRow.push(getValAtIndex(fieldObject.filename,i));
  thisRow.push(getValAtIndex(fieldObject.title,i));
  thisRow.push(getValAtIndex(fieldObject.source,i));
  thisRow.push(getValAtIndex(fieldObject.license,i));
  thisRow.push(getValAtIndex(fieldObject.credits,i));
  thisRow.push(getValAtIndex(fieldObject.url,i));
  thisRow.push(getValAtIndex(fieldObject.notes,i));
  thisRow.push(getValAtIndex(fieldObject.inits,i));
    //thisRow.push(getValAtIndex(fieldObject.ccReserved,i));  
    return thisRow;
}

//Take an object and create tab-separated row(s) with it
function tabbize(arr) {

  //It's not an array, we can just make a normal row
  if (!arr.expectArray){

    return makeRow(arr,0).join('\t');

  } else {

    //It is an array, we must make each row individually and then join them together
    var returnStrings = [];

    for (var i in arr.title) {
      var thisRow = makeRow(arr,i);


      var fullRow = thisRow.join('\t');
      returnStrings.push(fullRow);

    }

    return returnStrings.join('\n');

  }
}

//Sometimes, we need to get the user's initials for the spreadsheet
function getInitials(promptQuestion,promptDefault) {

    //This will either be the user's initials or blank if we don't have them stored
    promptDefault = promptDefault || "";
    var initials = null;

    
    //Annoying, but we keep asking for initials. This is important!
    while (initials == null) {
      initials = prompt(promptQuestion, promptDefault);
    }

    return initials;
}

//User has right clicked on the app icon. This brings up the contextual menu
function handleRightClick(info,tab) {
    var id = info.menuItemId;
    debug(info);
    debug(id);

    //These are mostly for debugging purposes
    if (id == "reset-initials") {
      chrome.storage.sync.remove(["initials"]);

    }

    if (id=="reset-sound") {
      chrome.storage.sync.remove(["playSound"]);

    }

    //These are mostly for debugging purposes
    if (id == "reset-update") {
      chrome.storage.sync.remove(["lastUpdate"]);
    }

    if (id == "use-sounds") {
      
      chrome.storage.sync.set({playSound: info.checked});
      enableSounds = info.checked;
      debug(enableSounds);
    }


    if (id == "set-initials") {
      testItems = chrome.storage.sync.get(['initials'], function(items) {

        var initials = items.initials;
        var myDate = new Date();
        var mySecs = myDate.getTime() ;
        var inits = getInitials("Please enter your initials",initials);
        chrome.storage.sync.set({initials:inits,lastUpdate:mySecs});

      });

    }


}

function handleClick(tab) {

  theTab = tab;

  //If it's been two hours, get new initials
  var secondDiff = 7200000;
  var secondDiffNiceName = "two hours";

  var myDate = new Date();
  var mySecs = myDate.getTime() ;


  var lastUp = 0;
  inits = "";

  setupAnimation("Thinking");

  //Get when the last initials were
  testItems = chrome.storage.sync.get(['initials','lastUpdate'], function(items) {

    var initials = items.initials;
    var lastUpdate = items.lastUpdate;
    var needUpdate = false;

    debug("Initials: "+initials);
    debug("Update  : "+lastUpdate);

    if (typeof lastUpdate != 'undefined') {
      lastUp = lastUpdate;
    }

    if (typeof initials != 'undefined' && initials != "") {
      inits = initials;
    } else {
      lastUp = mySecs;
      needUpdate = true;
      inits = getInitials("Please enter your initials");
    }

    var timePassed = mySecs - lastUp;
    debug("Time passed: "+timePassed/1000);

    if (timePassed > secondDiff) {
      debug("Too long: "+(timePassed));
      debug("My Date : "+mySecs);
      debug("Last Up : "+lastUp);
      lastUp = mySecs;
      needUpdate = true;
      inits = getInitials("It's been more than "+secondDiffNiceName+" since you last entered your initials. Please confirm them now.",inits);
    }




    chrome.tabs.insertCSS(null, {file: "basic.css"}, function () {
      chrome.tabs.executeScript(null, { file: "libs/jquery-1.11.3.min.js" }, function() {
        chrome.tabs.executeScript(null, { file: "libs/jquery.plainmodal.min.js" }, function() {
          chrome.tabs.executeScript(null, { file: "apikeys.js" }, function() {
            chrome.tabs.executeScript(null, {file:"globals.js"}, function() {
            chrome.tabs.executeScript(null, { file: "alerts.js" }, function() {
              chrome.tabs.executeScript(null, { file: "contentscript.js" }, function () {

                if (needUpdate) {
                  chrome.storage.sync.set({initials:inits,lastUpdate:mySecs});
                }
              });

              });
            });
          });
        });
      });
    });
  });
}

chrome.contextMenus.create({
  "type":"checkbox",
  "title":"Sound",
  "contexts":["page_action"],
  "id":"use-sounds"
});

chrome.contextMenus.create({
  "type":"normal",
  "title":"Set Initials",
  "contexts":["page_action"],
  "id":"set-initials"
});

chrome.contextMenus.create({
  "type":"normal",
  "title":"Reset Initials",
  "contexts":["page_action"],
  "id":"reset-initials"
});

if (debugMode) {
  chrome.contextMenus.create({
    "type":"normal",
    "title":"Reset Sound",
    "contexts":["page_action"],
    "id":"reset-sound"
  });
  chrome.contextMenus.create({
    "type":"normal",
    "title":"Reset Last Update Time",
    "contexts":["page_action"],
    "id":"reset-update"
  });

}



enableSounds  = chrome.storage.sync.get(['playSound'], function(items) {
  enableSounds = items.playSound;
  debug("Sounds: "+enableSounds);

  if (enableSounds == null) {
    chrome.storage.sync.set({playSound: true});
    enableSounds = true;
  }
  chrome.contextMenus.update("use-sounds", {checked: enableSounds});


});


chrome.pageAction.onClicked.addListener(handleClick);
chrome.contextMenus.onClicked.addListener(handleRightClick);




