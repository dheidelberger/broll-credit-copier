sites = [];


//Central function that prepares a message to send back to the background script 
//and also does some light debugging
//fieldObject.status can be "Success" "Fail" or "Warning" - unset assumes success
//fieldObject.expectArray if there is an array value somewhere in the list (Reuters MediaExpress, for example)

function message(fieldObject) {

	
	//Why not just pass an object directly as opposed to building it here?
	//Backwards compatibility!

	if (fieldObject.status===undefined) {
		fieldObject.status = "Success";
	}

	if (fieldObject.expectArray===undefined) {
		fieldObject.expectArray = false;
	}

	if ((fieldObject.credits == "") && (fieldObject.status !== "Fail")) {
		flashWarning("Warning",[noCreditHeader],[noCreditMessage]);
		fieldObject.status = "Fail";
	}



	ccLog("Filename: "+fieldObject.filename);
	ccLog("Title   : "+fieldObject.title);
	ccLog("Source  : "+fieldObject.source);
	ccLog("License : "+fieldObject.license);
	ccLog("Credits : "+fieldObject.credits);
	ccLog("URL     : "+fieldObject.url);
	ccLog("Status  : "+fieldObject.status);
	ccLog("Array?  : "+fieldObject.expectArray);

	//If we're in testing mode, we don't actually send the message
	//Instead, we set a globbal variable and append a div to the DOM. 
	//The test script is watching for this div
	if (!testingMode) {
		chrome.runtime.sendMessage({fields: fieldObject,messageid:"message"});
	} else {
		returnMessage = fieldObject;
		var signalNode = document.createElement('div');
		signalNode.className = 'broll-credit-copier-result';
		document.body.appendChild(signalNode);	
	}
	

}

//Template to make a new fieldObject
// var fieldObject = {}
// fieldObject.filename = "";
// fieldObject.title = 
// fieldObject.source = 
// fieldObject.license = 
// fieldObject.credits = 
// fieldObject.url = 
// message(fieldObject);	

