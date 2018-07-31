//Central function that prepares a message to send back to the background script 
//and also does some light debugging
//fieldObject.status can be "Success" "Fail" or "Warning" - unset assumes success
//fieldObject.expectArray if there is an array value somewhere in the list (Reuters MediaExpress, for example)

//function message(arr,hasError) {
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

	chrome.runtime.sendMessage({fields: fieldObject});

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


function dvids() {
	var fieldObject = {}
	fieldObject.url = window.location.href;
	fieldObject.title = $("h1.asset-title").text();
	
	//Array of credits. Then join them together with |
	//The credit generator tool knows to split for this character
	var credit = $(".asset_information .uk-width-large-7-10 a:nth-child(1)").map(
		function() {
			return $(this).text();
		}).get();

	fieldObject.credits = credit.join("|");
	fieldObject.filename = "";
	fieldObject.source = "DVIDS";
	fieldObject.license = "DVIDS";
	message(fieldObject);
}





//Youtube sucks now so we need to call the API
function youtube() {
	var linkURL = window.location.href;


	var url = $("a.ytp-title-link").attr("href");
	var id = getParameterByName("v",url);
	var part = "snippet,status,contentDetails";

	//youtubeKey variable can be found in apikeys.js. This file is not in version control
	//See readme.md for more details about recreating this file
	var request = "https://www.googleapis.com/youtube/v3/videos?part="+part+"&key="+youtubeKey+"&id="+id;

	var xhr = new XMLHttpRequest();
	xhr.timeout = 4000;

	xhr.ontimeout = function () {
		var fieldObject = {};
		fieldObject.status = "Fail"
		flashWarning("Error",["Request timed out"],["The request to the YouTube API timed out. Please try again later"],"red");
		message(fieldObject);
	}

	xhr.onreadystatechange = function () {
		debug(this.status);
		if (this.readyState == 4 && this.status == 200){
			var fieldObject = {};
			fieldObject.url = linkURL;
			fieldObject.filename = "";

			ytinfo  = JSON.parse(this.responseText).items[0];
			debug(ytinfo);
			fieldObject.title = ytinfo.snippet.title;
			fieldObject.license = ytinfo.status.license;
			fieldObject.credits = ytinfo.snippet.channelTitle;
			var definition = ytinfo.contentDetails.definition;
			debug("Definition: "+definition);

			needWarning = false;
			warningHdr = [];
			warningMsg = [];

			if (definition == "sd") {
				needWarning = true;
				warningHdr.push(sdHeader);
				warningMsg.push(sdMessage);
				
			}

			if (fieldObject.license == "youtube") {
				needWarning = true;
				warningHdr.push(copyrightHeader);
				warningMsg.push(copyrightMessage)

			}

			if (needWarning) {
				fieldObject.status = "Warning"
				flashWarning("Warning",warningHdr,warningMsg)

			}

			fieldObject.source = "YouTube";



			message(fieldObject);


		} else if (this.readyState == 4 && this.status != 200) {
			var fieldObject = {};
			fieldObject.status = "Fail"
			ccLog(this.responseText);
			var errorMsg = JSON.parse(this.responseText).error.message;
			flashWarning("Error Code: " +this.status,["YouTube API returned an error"],[errorMsg],"red");
			message(fieldObject);			
		}

	};

	xhr.open("GET",request);
	xhr.send();


}

function aparchive() {

	var url = window.location.href;
	var urlSplit = url.split("?");
	url = urlSplit[0];

	var title = $("h3[id*='content-slug'").text();

	title = title.replace(/^\W*/,"");



	var storyID = $("span[id*='content-storynumber']").text();
	title = title + " ("+storyID+")";
	
	var fieldObject = {};
	fieldObject.filename = "";
	fieldObject.title = title;
	fieldObject.source = "AP";
	fieldObject.licenseGood = "AP";
	fieldObject.credits = "AP";
	fieldObject.url = url;


	message(fieldObject);

}

function apimages() {
	var url = window.location.href;
	var title = $("div.ltNvPnl h1").text()
	var storyID = $("table.dnmkTbl tr:contains('ID:') td").eq(1).text().trim();

	title = title + " ("+storyID+")";

	var credit = $("table.dnmkTbl tr:contains('Photographer:') td").eq(1).text().trim();


	var fieldObject = {};
	fieldObject.filename = "";
	fieldObject.title = title;
	fieldObject.source = "AP";
	fieldObject.license = "AP";
	fieldObject.credits = "AP|"+credit
	fieldObject.url = url;

	message(fieldObject);

}




function newscom() {
	var url = window.location.href;
	var searchString = getParameterByName("searchString",url);

	var leftURL = url.split("?")[0];

	var url = leftURL+"?searchString="+searchString
	
	var title = $("div.displaydetails:contains('Headline')").eq(0).next().text();

	var fieldObject = {};
	fieldObject.filename = "";
	fieldObject.title = title;
	fieldObject.source = "Reuters";
	fieldObject.license = "Reuters";
	fieldObject.credits = "Reuters";
	fieldObject.url = url;
	message(fieldObject);
}

//Helper method to see if a Vimeo clip is properly licensed
function goodLicense(license) {
    var goodLicenses = ["by","by-nc","by-nc-nd","by-nc-sa","by-nd","by-sa","cc0"];

    var licenseFound = goodLicenses.indexOf(license);

    return (licenseFound > -1);

}

//Helper method to check for HD. We look in either the x or y direction
function goodSize(height,width){
    var myHeight = parseInt(height);
    var myWidth = parseInt(width);

    return ((myHeight >= 720) || (myWidth >= 1280));
}



function vimeo() {
	var fieldObject = {};

	var isPrivate = $('span[title="Private Link"]').length > 0;
	var hasError = false;

	if (isPrivate) {
		flashWarning("Warning",["Private Video"], 
			["This is a private Vimeo video. While it may be usable, unfortunately, due to limitations in the Vimeo API, Credit Copier is unable to read the metadata for this video."],
			"Red");
		fieldObject.status = "Fail";
		message(fieldObject);
		return;

	}

	var vidID = $(".player_container").attr("id").replace("clip_","").trim();

	debug("ID: "+vidID);
    
    var request = "https://api.vimeo.com/videos/"+vidID+"?"+"fields=name,license,height,width,link,user.name";
   
    
    //TODO: Make async. See YouTube
    var xhr = new XMLHttpRequest();
	xhr.timeout = 4000;

	xhr.ontimeout = function () {
		fieldObject.status = "Fail"
		flashWarning("Error",["Request timed out"],["The request to the Vimeo API timed out. Please try again later"],"red");
		message(fieldObject);
	}

	xhr.onreadystatechange = function () {
		debug(this.status);
		
		if (this.readyState == 4 && this.status == 200){
		    vimeoData = this.responseText;

		    debug(this.responseText);
		    debug(this.getAllResponseHeaders())
		    

		    var vimObject = JSON.parse(vimeoData);

		    var vim = {};
		    vim.id = vidID;
		    vim.link = vimObject.link;
		    vim.title = vimObject.name;
		    vim.credit = vimObject.user.name;
		    vim.license = vimObject.license;
		    vim.height = vimObject.height;
		    vim.width = vimObject.width;

			needWarning = false;
			warningHdr = [];
			warningMsg = [];


		    var licenseGood = goodLicense(vim.license);
		    if (!licenseGood) {
		        vim.license = "COPYRIGHTED";
				needWarning = true;
		 		warningHdr.push(copyrightHeader);
		 		warningMsg.push(copyrightMessage);
		    }

		    
		    var sizeGood = goodSize(vim.height,vim.width);
		    if (!sizeGood) {
				needWarning = true;
				warningHdr.push(sdHeader);
				warningMsg.push(sdMessage);
		    }

			if (needWarning) {
				flashWarning("Warning",warningHdr,warningMsg);
				fieldObject.status = "Warning";


			}

			fieldObject.filename = "";
			fieldObject.title = vim.title;
			fieldObject.source = "Vimeo";
			fieldObject.license = vim.license;
			fieldObject.credits = vim.credit;
			fieldObject.url = vim.link;
			message(fieldObject);	

		} else if (this.readyState == 4 && this.status != 200) {
			fieldObject.status = "Fail"
			ccLog(this.responseText);
			var errorMsg = JSON.parse(this.responseText).error;
			flashWarning("Error Code: " +this.status,["Vimeo API returned an error"],[errorMsg],"red");
			message(fieldObject);			
		}

	};

    xhr.open("GET",request);

    //vimeoKey in apikeys.js - see readme.md
    xhr.setRequestHeader("Authorization",vimeoKey);
    xhr.send();

	

}

function videoblocks() {	
	var url = window.location.href;
	var title = $("h1").text()

	var buttonText = $('button#stock-item-primary-action-button').text().trim();
	var fieldObject = {};

	debug("Button says: "+buttonText);

	if (buttonText === "Add to Cart") {
		fieldObject.status = "Fail";
		flashWarning("Stop",["This clip is not usable"],["This clip is from the VideoBlocks Marketplace, which means it would need to be purchased separately. Please constrain your search to 'Members-Only Content.'"],"halt")
	}

	fieldObject.filename = ""
	fieldObject.title = title;
	fieldObject.source = "VideoBlocks"
	fieldObject.license = "VideoBlocks"
	fieldObject.credits = "VideoBlocks"
	fieldObject.url = url
	message(fieldObject);
	
}

function unifeed() {
	var url = window.location.href;
	var title = $("h1.page-header").text();
	var credit = $("div.multimedia_asset_node_field_title:contains('Source')").next().text().trim();
	
	//Seems to be less reliable than the new method below
	//var file = $("div.multimedia_asset_node_field_title:contains('Alternate Title')").next().text().trim();

	var file = $("meta[property='og:image']").attr('content').split("/").pop().split(".")[0]

	var fieldObject = {};
	fieldObject.filename = file;
	fieldObject.title = title;
	fieldObject.source = "Unifeed";
	fieldObject.license = "Unifeed";
	fieldObject.credits = credit;
	fieldObject.url = url;
	message(fieldObject);

}

function flickr() {
	var fieldObject = {};

	var url = $("head meta[property='og:url']").attr("content");
	var title = $("head meta[property='og:title']").attr("content");
	var licenseIcon = $("div.photo-license-info a i").first().attr("class");

	var licenseNumber = parseInt(licenseIcon.replace(/ui-icon-tiny-/g, "").replace(/cc/g,""));

	debug(licenseIcon);
	debug(licenseNumber);

	var license = "";

	switch(licenseNumber) {
	    case 0:
	        license = "COPYRIGHTED";
	        break;
	    case 1:
	        license = "BY-NC-SA";
	        break;
		case 2:
			license = "BY-NC";
			break;
		case 3:
			license = "BY-NC-ND";
			break;
		case 4:
			license = "BY";
			break;
		case 5:
			license = "BY-SA";
			break;
		case 6:
			license = "BY-ND";
			break;
		case 8:
			license = "Public Domain";
			break;
	    default:
	        license = "Unkown";
	}

	var credit = $("div.attribution-info a.owner-name").first().text();
	
	if (license == "COPYRIGHTED") {
		fieldObject.status = "Warning";
		flashWarning("Warning",[copyrightHeader],[copyrightMessage])
	}

	fieldObject.filename = "";
	fieldObject.title = title;
	fieldObject.source = "Flickr";
	fieldObject.license = license;
	fieldObject.credits = credit;
	fieldObject.url = url;
	message(fieldObject);	

}

function freeSound() {
	var url = window.location.href;
	var title = $("head meta[property='og:audio:title']").attr("content");
	var credit = $("head meta[property='og:audio:artist']").attr("content");
	var license = $("div#sound_license a")[0].href.replace(/http:\/\/creativecommons.org\//g,"").replace(/licenses\//g, "").replace(/\/.*/g,"");

	var fieldObject = {};
	fieldObject.filename = "";
	fieldObject.title = title;
	fieldObject.source = "FreeSound";
	fieldObject.license = license;
	fieldObject.credits = credit;
	fieldObject.url = url;
	message(fieldObject);
}

//Reuters Connect. Replacement for MediaExpress, and very simimlar page structure.
//Unlike MediaExpress, there are no clip bundles. Makes life much easier!
function reutersConnect() {
	var fieldObject = {};
	var credit = "Reuters";

	//https://www.reutersconnect.com/all?id=tag%3Areuters.com%2C2018%3Anewsml_LVA0038MX2ERD%3A1&

	//Convert the tag to a URL that lets us link back to the story
	var videoTag = encodeURIComponent($("span#selected-item-id").text());
	var videoURL = "https://www.reutersconnect.com/all?share=true&id=" + videoTag;	


	//Get the title
	var title = $("div.item-detail h2[data-qa-component='item-headline").text().replace(/(\r\n|\n|\r)/gm," ");

	var restrictions = $("span[data-qa-component='meta-data-restrictions-value']").text().replace(/(\r\n|\n|\r)/gm,"");
	var license = "RESTRICTIONS: "+restrictions

	fieldObject.filename = "";
	fieldObject.title = title;
	fieldObject.source = "Reuters Connect";
	fieldObject.license = license;
	fieldObject.credits = credit;
	fieldObject.url = videoURL;
	message(fieldObject);	

}


//Reuters MediaExpress can have collections of multiple clips
//The collection has its own id, saved as collectionURL here
function mediaExpress() {
	var fieldObject = {};

	//Is this a multiple clip story?
	var clipCount = parseInt($("li[data-qa-label='clip-count']").attr('data-qa-value'));
	var credit = "Reuters";
	var baseURL = "http://mediaexpress.reuters.com/detail/?id=";

	//Convert the tag to a URL that lets us link back to the story
	var collectionTag = encodeURIComponent($("span#selected-item-id").text());
	var collectionURL = "http://mediaexpress.reuters.com/detail/?id=" + collectionTag
	
	var title = $("div.item-detail h2.headline").text().replace(/(\r\n|\n|\r)/gm," ");

	if (clipCount > 1) {
		debug("It's a list of clips");

		if (!$('span.package-view-list').hasClass('selected')) {
			flashWarning("Error",["MediaExpress must be in shotlist mode"],
				["This tool cannot properly copy information for multishot MediaExpress clips unless MediaExpress is in Shotlist mode instead of Slideshow mode."],
				"Red");
			fieldObject.status = "Fail"
			message(fieldObject);
			return null;
		}


		//Get the URLs for all of the stories on the page
		var urlList = $.map($("div[data-item-id]"), function(x) {
			var thisURLID = $(x).attr('data-item-id');
			debug("URL: "+thisURLID);
			return baseURL+encodeURIComponent(thisURLID);
		});

		debug("URL List: "+urlList);


		//Use the overall title and add the first line of the shotlist for each clip
		var titleList = $.map($('div.package-list-item').find('div.story'),function(x,idx){

			return title+" (Clip "+(idx+1)+"): "+$(x).find('p')[0].textContent.replace(/(\r\n|\n|\r)/gm,"");
		});

		debug("Title List: "+titleList);

		//Get restrictions, if any, for each clip
		var licenseList = $.map($("div.left li.restrictions"),function(x) {
			var thisRestriction = $(x).attr("data-qa-value").replace(/(\r\n|\n|\r)/gm,"");
			return "RESTRICTIONS: "+thisRestriction

		});

		//If expectArray is true, the processing script in the background knows the content is an array
		//Not every field needs to be an array, though. Scalar fields will be repeated on each line
		//The background script knows automatically to handle scalar and array fields properly as long as expectArray is true.
		fieldObject.filename = "";
		fieldObject.title = titleList;
		fieldObject.source = "Collection link: "+collectionURL;
		fieldObject.license = licenseList;
		fieldObject.credits = credit;
		fieldObject.url = urlList;
		fieldObject.expectArray = true;

		showSelectionModal(fieldObject);

	} else { //Just a single shot
		debug("It's a single shot");
		var idLink = $('div.fp-playlist a').attr('href')
		var idArray = idLink.match(/content\/(.*)\//); 
		var fullID = idArray[1]
		var restrictions = $("div.right li.restrictions").attr("data-qa-value").replace(/(\r\n|\n|\r)/gm,"");
		var license = "RESTRICTIONS: "+restrictions
		var myTag = encodeURIComponent(fullID);
		var url = baseURL + myTag

		fieldObject.filename = "";
		fieldObject.title = title;
		fieldObject.source = "Reuters MediaExpress";
		fieldObject.license = license;
		fieldObject.credits = credit;
		fieldObject.url = url;
		message(fieldObject);	

	}
}

function europeanCommission() {
	var url = window.location.href;
	var title = $('h3')[1].innerText.trim()
	var credit = $('span#agency').text().replace(/.*Source: /i,"").trim();
	var license = "EC Handout"

	var fieldObject = {};
	fieldObject.filename = "";
	fieldObject.title = title;
	fieldObject.source = "European Commission";
	fieldObject.license = license;
	fieldObject.credits = credit;
	fieldObject.url = url;
	message(fieldObject);	



}

function ruptly() {
	var fieldObject = {};
	var url = window.location.href;
	var title = $('h1.ng-binding').text().trim();
	var restrictions = $('dt:contains("Restrictions:")')[0].nextSibling.nextSibling.innerText.trim();
	var license = "Ruptly";
	if (restrictions != "") {
		license = "Restrictions: "+restrictions;
	}
	var credit = "Ruptly";

	var signupText = $('li.ng-hide').text().trim();

	if (signupText != "Sign upLogin") {
		flashWarning("Warning",
			["You are not logged in"],
			["While this tool will still work if you're not logged in to Ruptly, it has no way of warning you whether or not the content is free to use or pay content. Please consider logging in."]);		
		fieldObject.status = "Warning";
	}

	//This is pay content
	if ($("button:contains('Calculate the price and buy')").length != 0) {
		flashWarning("Stop",
			["This clip is not usable"],
			["This clip is pay content from Ruptly. Only pool and free footage from Ruptly should be used."],
			"Red"
			);
		fieldObject.status = "Fail";
	}

	var fieldObject = {};
	fieldObject.filename = "";
	fieldObject.title = title;
	fieldObject.source = "Ruptly";
	fieldObject.license = license;
	fieldObject.credits = credit;
	fieldObject.url = url;
	message(fieldObject);	

}

function newsmarket() {
	var title = $("div.title h1").text().trim();
	var credits = $("b:contains('SOURCE:')")[0].nextElementSibling.innerText + "|The NewsMarket";
	var license = $("div.asset-usagerights div.visible-text").text().trim();
	var url = window.location.href

	var fieldObject = {};
	fieldObject.filename = "";
	fieldObject.title = title;
	fieldObject.source = "The NewsMarket";
	fieldObject.license = license;
	fieldObject.credits = credits;
	fieldObject.url = url;
	message(fieldObject);	

}

function pond5Search(url) {
	var fieldObject = {};

	title = JSON.parse($("div.MediaFormats").attr("formats_data")).title;
	var price = Number($("span.js-selectedMediaPrice").text().trim().replace("$",""));

	var license = "Public Domain";
	if (price>0) {
		license = "Pond5";
		flashWarning("Stop",[pond5MoneyHeader],[pond5MoneyMessage],"Red");
		fieldObject.status = "Fail";
	}
	

	fieldObject.filename = "";
	fieldObject.title = title;
	fieldObject.source = "Pond5";
	fieldObject.license = license;
	fieldObject.credits = "Pond5";
	fieldObject.url = url;
	message(fieldObject);	

}

function pond5Result() {
	var fieldObject = {};
	var title = $("h1.ItemDetail-mediaTitle span").text().trim();
	var url = window.location.href;
	var price = Number($("span.js-selectedMediaPrice").text().trim().replace("$",""))
	var license = "Public Domain";
	if (price>0) {
		flashWarning("Stop",[pond5MoneyHeader],[pond5MoneyMessage],"Red");
		license = "Pond5"
		fieldObject.status = "Fail";
	}

	fieldObject.filename = "";
	fieldObject.title = title;
	fieldObject.source = "Pond5";
	fieldObject.license = license;
	fieldObject.credits = "Pond5";
	fieldObject.url = url;
	message(fieldObject);	
}


var url = window.location.href;
ccLog(url);



try {

	if (url.includes("dvidshub.net")) {
		dvids();
	}

	if (url.includes("youtube.com")) {
		youtube();
	}

	if (url.includes("vimeo.com")) {
		vimeo();
	}

	if (url.includes("aparchive.com")) {
		aparchive();
	}

	if (url.includes("apimages.com")) {
		apimages();
	}

	if (url.includes("newscom.com")) {
		newscom();
	}

	if (url.includes("videoblocks.com")) {
		videoblocks();
	}

	if (url.includes("unmultimedia.org")) {
		unifeed();
	}

	if (url.includes("flickr.com")) {
		flickr();
	}

	if (url.includes("freesound.org")) {
		freeSound();
	}

	if (url.includes("thenewsmarket.com")) {
		newsmarket();
	}

	if (url.includes("ruptly.tv")) {
		ruptly();
	}

	if (url.includes("pond5.com")) {
		pond5Result();
	}

	if (url.includes("mediaexpress.reuters.com")) {
		mediaExpress();
	}

	if (url.includes("ec.europa.eu")) {
		europeanCommission();
	}

	if (url.includes("reutersconnect.com")) {
		reutersConnect();
	}

} catch(err) {
	var fieldObject = {}
	fieldObject.status = "Fail";
	fieldObject.filename = "Could not copy clip information";
	fieldObject.title = "Error message: "+err.message,
	fieldObject.source = "Please report this URL for further investigation";
	fieldObject.license = "";
	fieldObject.credits = " ";
	fieldObject.url = url;
	message(fieldObject);	
	flashWarning("Error",["Could not copy clip information"],["Error message: "+err.message+"<br>Please report this URL for further investigation: "+url],"Red");

}



