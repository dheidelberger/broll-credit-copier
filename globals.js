//In debug mode, all debug() calls will print to the console
var debugMode = true;

//Preprocessing directive to turn off debugging if in production
//This is activated from Gulp
/* @ifdef PRODUCTION **
debugMode = false;
/* @endif */



//In silent mode, ccLog() calls will not print to the console
var silentMode = false;

//Testing mode - used for running our tests - redirects some Chrome Extension specific calls
var testingMode = false;


//Only print these log messages in debug mode
function debug(message) {
	if (debugMode) {
		console.log(message);
	}
}

//Disable all logging by turning silentMode on
function ccLog(message) {
    if (!silentMode) {
        console.log(message);
    }
}

//Sometimes, the values in our object will be arrays, sometimes they will be scalar
//This function will return the value at an index if it's an array, or just the value if scalar
function getValAtIndex(obj,index) {
  if (Array.isArray(obj)) {
    return obj[index];
  } else {
    return obj;
  }
}

//Function to break up parameters from a URL
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
  results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}
