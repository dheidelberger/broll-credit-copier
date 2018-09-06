var iconDelay = 50;
var iconIndex = 0;

var iconModes = ["Static","Thinking","Success","Fail","Warning"];
var iconMode = "Static";
var modeSize = {
  "Static": 1,
  "Thinking": 120,
  "Success": 31,
  "Fail": 31,
  "Warning": 31 
};

var iconTimer = null;


function setupAnimation(mode,myPlayOnce) {
  var playOnce = myPlayOnce || false;
  window.clearTimeout(iconTimer);
  debug("Setting up. Play once? "+playOnce);
  iconMode = mode;
  iconIndex = 0;
  iconTimer = window.setTimeout(animateIcon, iconDelay, mode,playOnce);
}

function animateIcon(mode, myPlayOnce) {
  var playOnce = myPlayOnce || false;               
  debug("Animate: "+mode+", index: "+iconIndex);

  if (mode === "Static") {
      chrome.pageAction.setIcon({tabId: theTab.id, 
      path: {
        16: "images/icon16.png",
        24: "images/icon24.png",
        32: "images/icon32.png",

      }});

      return;
  }

  if (mode === iconMode) {
    var folder = "images/icon"+mode;
    var name = "icon"+mode+iconIndex+".png";
    chrome.pageAction.setIcon({tabId: theTab.id, 
        path: {
          16: folder+"/16/"+name,
          24: folder+"/24/"+name,
          32: folder+"/32/"+name,

        }});
      iconIndex = iconIndex+1;

      if ((iconIndex >= modeSize[mode]) && (playOnce)) {
        debug("We're not going to play any more");
        setupAnimation("Static");
        return;
      }


      iconIndex = iconIndex % modeSize[mode];
      iconTimer = window.setTimeout(animateIcon, iconDelay, mode,playOnce);
  }
}