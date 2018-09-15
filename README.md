# B-Roll Credit Copier

A Chrome extension to copy clip metadata from a number of key stock footage sources. Mostly through scraping, but also through APIs where needed. This was developed specifically for an in-house workflow, but I'm open-sourcing it so others can use it as-is and adopt my workflow or adapt it to their own workflow. 

Our workflow is geared heavily towards HD "freeroll" sources (plus a few licensing deals like AP and Reuters), so the tool will "helpfully" warn (nag) you if you try to copy SD or non-free sources. It's on the to-do list at some point to customize the level of nagging. 

#### List of compatible websites:
* [AP Archive](http://www.aparchive.com)
* [AP Images](http://www.apimages.com)
* [DVIDSHub](http://www.dvidshub.net)
* [The European Commission Audiovisual Services](https://ec.europa.eu/avservices)
* [Flickr](http://www.flickr.com)
* [Freesound](http://www.freesound.org)
* [The NewsMarket](http://www.thenewsmarket.com)
* [Pond5 Public Domain](https://www.pond5.com/free)
* [Reuters Connect](https://www.reutersconnect.com/)
* [Reuters MediaExpress](http://mediaexpress.reuters.com/)+
* [Reuters Newscom](http://www.newscom.com)*
* [Ruptly](http://www.ruptly.tv)
* [United Nations Unifeed](http://www.unmultimedia.org/tv/unifeed/)
* [VideoBlocks](http://www.videoblocks.com)
* [Vimeo](http://www.vimeo.com)
* [YouTube](http://www.youtube.com)

\+ - Reuters is phasing out MediaExpress. In my workflow, I've moved on to Reuters Connect and I'm no longer maintaining MediaExpress compatibility 
\* - I no longer have access to Reuters Newscom, so the tool may or may not work with it any more.

## NOTE
As of version 2.1.0, I've added a number of new features, most notably testing. This has required a lot of code reconfiguration and also means that there's now a building process for the extension via Gulp. I haven't had time to update this documentation yet, so for the moment, the installation, build, and contribution sections are not very accurate.

## Installation

### "Prebuilt" version from the Chrome store
If you're just interested in using the tool, you can install it with one click from the Chrome store at this link:
[https://chrome.google.com/webstore/detail/b-roll-credit-copier/gnndiaoenmcmkcghlgkdnkdilnhoheog](https://chrome.google.com/webstore/detail/b-roll-credit-copier/gnndiaoenmcmkcghlgkdnkdilnhoheog)

### Adapting it to your own workflow
You are also free to download and adapt the code as you like. Please be sure to read the [License](#license) section for important information about making your own version.

**Note that as of 2.1.0, a number of changes have made this section of the documentation somewhat obsolete. I'll try to update it when I can.**

The code should work out-of-the-box except that you'll need to use your own API keys for YouTube and Vimeo. You can find directions for how to do that in [apikeys.sample.js](apikeys.sample.js). Check out the [Chrome documentation](https://developer.chrome.com/extensions/getstarted#unpacked) for information about how to install an extension you are developing.

As of version 2.0.4, I'm including jQuery and the jQuery plainmodal plugin in the git repo. I realize that this is a somewhat frowned upon decision, but my reason for doing so is to make it so it really does work out-of-the-box and a novice who wants to tinker with the code doesn't have to deal with some sort of package installer. Feel free to delete the contents of the 'libs' folder and download your own versions of [jQuery](https://jquery.com/) and [jQuery plainmodal](https://github.com/anseki/jquery-plainmodal). You'll have to modify the executeScripts code in [background.js](background.js#L340-L341) if the library file names are different.

## Usage

Once it's installed, if you're on a page where there is compatible footage, you can click on the icon (or press alt/option-c) and it will copy the metadata to your clipboard.

The metadata is copied into a line of tab-separated text with the following columns:

* Filename - Typically blank because in my workflow, the b-roll researcher does not download the footage, the editor does, and it's the editor who fills in the column.
* Description - Usually the title of the video.
* Source - The website the video comes from (youtube, vimeo, aparchive, etc.).
* License - Either a flavor of Creative Commons, "copyrighted," a catch-all for non-Creative Commons content, or another site-specific copyright license.
* Credit - Usually the username for sites like YouTube and Vimeo, more advanced for other sites. On some sites, like DVIDSHUB.net, there is often more than one creator. In cases like that, the credits are separated by the pipe | symbol. I have another automated tool in my workflow to generate closing credits and it knows to separate on a pipe.
* Link - Link to the footage
* Note - This field is blank, the b-roll researcher uses this field to fill in any notes about the clip, including timecode for the editor to use, etc.
* Initials - Initials of the person who found the clip.


## Contributing

**Note that as of 2.1.0, a number of changes have made this section of the documentation somewhat obsolete. I'll try to update it when I can.**

If there's another website that you want to add to the tool, please feel free to code it yourself and submit a pull request, or you can submit a feature request on the issue tracker page and I'll try to take a look if and when I have the time.

To add a new site, there are three places you need to add code:

1. In [background.js](background.js), add a new rule to the declarativeContent section. This will make Chrome recognize that the tool is compatible with that site. Check Google's [documentation on declarativeContent](https://developer.chrome.com/extensions/declarativeContent) for information about how to write your own rules. The rule should be specific to a page where there's metadata to copy. So, for example, the css part of the Vimeo rule below makes sure that the user is on a page with a video on it and not on a search result page or some other page on the Vimeo site. There's a fair amount of trial and error in this process. Most of the bugs that I fix in the code at this point are when I discover some new way a site displays videos that means the rule either matches when it shouldn't or doesn't match when it should.

```javascript
 new chrome.declarativeContent.PageStateMatcher({
    pageUrl: {
        hostContains:   'vimeo.com',
    },
    css: ['div.player_area']

})
```

2. In [contentscript.js](contentscript.js), create a new function for the website you want to add. The convention I've been using is to name the function after the website. The function should do all the scraping on the page and create an object with the necessary fields. At the end of the function, call the `message()` function and pass it the object. Look at the Vimeo function in the code for an example of how to do this asynchronously, where we need to wait for the result of an API call before we can call the message function. jQuery is injected into pages where Credit Copier is used, so you can use jQuery to help you scrape. Here's an example of a typical function. You'll have to figure out your own jQuery queries to scrape the appropriate data from the site:

```javascript
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

    //Optional, if left out, "Success" is assumed
    //Can also be "Fail" or "Caution"
    //This value determines what SFX and animation is played
    fieldObject.status = "Success" 
    
    message(fieldObject);
}
```

If you need to present the user with an error message or warning, check out [alerts.js](alerts.js), which is built on top of the [jQuery plainModal plugin](https://github.com/anseki/jquery-plainmodal). There should be comments in that file which will help you create your own warnings and errors. It also includes a way of copying multiple clips at once. See the mediaExpress function for how to handle multiple clips.

3. Finally, in [contentscript.js](contentscript.js), you'll need to add an if statement to call your function.
        
```javascript
if (url.includes("dvidshub.net")) {
    dvids();
}

```

## History

* 2.1.0 - Added testing using Node, Google Puppeteer, Mocha, and Chai. A great deal of code refactoring to support the testing framework. Added a build process via Gulp to address some of the refactoring. Many bug fixes including for Ruptly, Flickr, VideoBlocks, and Pond5.
* 2.0.4 - Added support for Reuters Connect, rewrote Pond5 to accoomodate site redesign, added jquery and jquery.plainmodal to Git repository.
* 2.0.3 - Improved how MediaExpress multishot clips are reported. User gets more information now about the package link and the clip index)
* 2.0.2 - Reorganized and cleaned up folder structure a bit, fixed bug in Newsmarket
* 2.0.1 - Fixed an issue with identifying filenames for Unifeed footage
* 2.0.0 - Initial open source release, also significant redesign to allow for async API calls, animated icon, audio feedback for clicks, many other small changes and bug fixes
* All versions prior to 2.0.0 are closed source and not available on GitHub.

## Credits

B-Roll Credit Copier is written and maintained by David Heidelberger. I'm a full-time video editor and producer and part-time software developer. I use this tool and many other proprietary ones every day at my day job on a documentary series on PBS. I'm available for workflow consultation and custom software solutions for your post-production workflow. To get in touch about a consult, or just to tell me how you're using the tool, I'd love to [hear from you](mailto:david.heidelberger@gmail.com).

The icon was designed by [Ivan Dotsenko](https://www.behance.net/idots). He's awesome and fast and you should give him a shout if you're looking for an icon. I did the icon animations myself, so if you hate those, don't blame Ivan!

The success and failure sound effects are from [Freesound](http://www.freesound.org).
* [Scissor sound](http://freesound.org/people/Sclolex/sounds/236007/) by Sclolex, released as public domain
* [Clunk sound](http://freesound.org/people/korgchops/sounds/170633/) by korgchops, released as public domain

## License<a name="license"></a>
B-Roll Credit Copier is released under an MIT license. However, I maintain ownership of the program name, *B-Roll Credit Copier*, and the icon artwork. In other words, the code is all free to use, but if you want to release your own version, please give it a different name and get your own icons.

Copyright 2017, David Heidelberger

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.



