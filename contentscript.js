var url = window.location.href;
ccLog(url);

try {

	debug("Executing contentscript");

	sites.forEach(function(aSite) {
		debug("Loading script for site: "+aSite.name);
		aSite.contentScript();

	});

} catch(err) {
	var fieldObject = {};
	fieldObject.status = "Fail";
	fieldObject.filename = "Could not copy clip information";
	fieldObject.title = "Error message: "+err.message;
	fieldObject.source = "Please report this URL for further investigation";
	fieldObject.license = "";
	fieldObject.credits = " ";
	fieldObject.url = url;
	message(fieldObject);	
	flashWarning("Error",["Could not copy clip information"],["Error message: "+err.message+"<br>Please report this URL for further investigation: "+url],"Red");

}



