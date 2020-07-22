# B-Roll Credit Copier

A Chrome extension to copy clip metadata from a number of key stock footage sources. Mostly through scraping, but also through APIs where needed. This was developed specifically for an in-house workflow, but I'm open-sourcing it so others can use it as-is and adopt my workflow or adapt it to their own workflow.

Our workflow is geared heavily towards HD "freeroll" sources (plus a few licensing deals like AP and Reuters), so the tool will "helpfully" warn (nag) you if you try to copy SD or non-free sources. It's on the to-do list at some point to customize the level of nagging.

#### List of compatible websites:

-   [AP Archive](http://www.aparchive.com)
-   [AP Images](http://www.apimages.com)
-   [DVIDSHub](http://www.dvidshub.net)
-   [The European Commission Audiovisual Services](https://ec.europa.eu/avservices)
-   [Flickr](http://www.flickr.com)
-   [Freesound](http://www.freesound.org)
-   [Getty Images](https://www.gettyimages.com/)
-   [Getty Music](https://www.gettyimages.com/music)
-   [The NewsMarket](http://www.thenewsmarket.com)
-   [Pond5 Public Domain](https://www.pond5.com/free)
-   [Reuters Connect](https://www.reutersconnect.com/)
-   [Reuters MediaExpress](http://mediaexpress.reuters.com/)+
-   [Reuters Newscom](http://www.newscom.com)\*
-   [Ruptly](http://www.ruptly.tv)
-   [Shutterstock](https://www.shutterstock.com)
-   [UNICEF WeShare](https://weshare.unicef.org)
-   [United Nations Unifeed](http://www.unmultimedia.org/tv/unifeed/)
-   [StoryBlocks](http://www.storyblocks.com)
-   [Vimeo](http://www.vimeo.com)
-   [YouTube](http://www.youtube.com)

\+ - Reuters is phasing out MediaExpress. In my workflow, I've moved on to Reuters Connect and I'm no longer maintaining MediaExpress compatibility

\* - I no longer have access to Reuters Newscom, so the tool may or may not work with it any more.

## NOTE

Version 2.2.0 implements a new streamlined way of adding a new site that breaks the testing implemented in 2.1.0. Tests will have to be updated, but the documentation is now, at least, current!

## Privacy Policy

#### See [PRIVACY.md](PRIVACY.md)

## Installation

### "Prebuilt" version from the Chrome store

If you're just interested in using the tool, you can install it with one click from the Chrome store at this link:
[https://chrome.google.com/webstore/detail/b-roll-credit-copier/gnndiaoenmcmkcghlgkdnkdilnhoheog](https://chrome.google.com/webstore/detail/b-roll-credit-copier/gnndiaoenmcmkcghlgkdnkdilnhoheog)

### Adapting it to your own workflow

You are also free to download and adapt the code as you like. Please be sure to read the [License](#license) section for important information about making your own version.

The code should work out-of-the-box except that you'll need to use your own API keys for YouTube and Vimeo. You can find directions for how to do that in [apikeys.sample.js](apikeys.sample.js). Check out the [Chrome documentation](https://developer.chrome.com/extensions/getstarted#unpacked) for information about how to install an extension you are developing.

While you can just drag this entire folder into your Chrome Extensions page and this extension will work, there are a lot of extra files in the folder that are necessary for testing and debugging but aren't necessary for your final build. As such, I've added a build step using [Gulp](https://gulpjs.com/).

To build the extension, you'll need to have [Node.JS and NPM](https://nodejs.org/en/) installed. Once those are installed, navigate to the root folder of the project and in your terminal, type:

```sh
npm install
```

This will install the various dev dependencies. To build the extension, in your terminal, type:

```sh
npm run build
```

This will run some linting and copy all the required files into a folder called "build." It will then zip the entire extension and move the zip file into a sibling folder to the project root called "Broll Credit Copier Distribution Builds."

As of version 2.0.4, I'm including various libraries in the libs folder in the git repo. I realize that this is a somewhat frowned upon decision, but my reason for doing so is to make it so it really does work out-of-the-box and a novice who wants to tinker with the code doesn't have to deal with some sort of package installer. Feel free to delete the contents of the 'libs' folder and download your own versions of the libraries, however you'll have to modify code in a few places if the library flenames are different.

## Usage

Once the extension is installed in Chrome, if you're on a page where there is compatible footage, you can click on the icon (or press alt/option-c) and it will copy the metadata to your clipboard.

The metadata is copied into a line of tab-separated text with the following columns:

-   Filename - Typically blank because in my workflow, the b-roll researcher does not download the footage, the editor does, and it's the editor who fills in the column.
-   Description - Usually the title of the video.
-   Source - The website the video comes from (youtube, vimeo, aparchive, etc.).
-   License - Either a flavor of Creative Commons, "copyrighted," a catch-all for non-Creative Commons content, or another site-specific copyright license.
-   Credit - Usually the username for sites like YouTube and Vimeo, more advanced for other sites. On some sites, like DVIDSHUB.net, there is often more than one creator. In cases like that, the credits are separated by the pipe | symbol. I have another automated tool in my workflow to generate closing credits and it knows to separate on a pipe.
-   Link - Link to the footage
-   Note - This field is blank, the b-roll researcher uses this field to fill in any notes about the clip, including timecode for the editor to use, etc.
-   Initials - Initials of the person who found the clip.

## Contributing

If there's another website that you want to add to the tool, please feel free to code it yourself and submit a pull request, or you can submit a feature request on the issue tracker page and I'll try to take a look if and when I have the time.

To add a new site, you should do the following:

1. In the [sites](sites) folder, create a new file called `[sitename]`.js.

2. In that new file, use the following skeleton:

    ```js
    sites.push({
        name: '[SITENAME]',

        stateMatcher: {
            //Create a pagestatematcher along the lines of Google's DeclarativeContent spec here:
            //https://developer.chrome.com/extensions/declarativeContent
            //The extension will only be clickable if the pagestatematcher conditions are met
            //This can also be an array of objects if there are multiple types of pages you want to support
            //   It is your responsibility in your contentscript to run the appropriate code for the state
            //   Check shutterstock.js for examples of dealing with multiple pagestatematchers
        },

        listener: function (message, sender, sendResponse) {
            // This is an optional function and is only necessary if you need to query an API
            // Chrome has disabled cross-origin http requests in content scripts
            // https://www.chromium.org/Home/chromium-security/extension-content-script-fetches
            // If you need to make such a request, you can include this function and it will be injected into your background script
            // You'll then need to message this listener from your content script
            // The message should have a key called messageid that is a unique string to this site
            // See youtube.js for an example of how this is implemented
        },

        contentScript: function () {
            //Name sitename after your site (ie: youtube, vimeo, etc.)
            var sitename = function () {
                var fieldObject = {}; //This is the object that will get passed to the clipboard eventually

                //Put code here to get the necessary metadata from the page.
                //The following properties should be set for every page

                fieldObject.url = window.location.href; //Page url
                fieldObject.title = ''; //Video title
                fieldObject.credits = ''; //Appropriate credit, multiple credits can be joined with a pipe (|)
                fieldObject.filename = ''; //Always blank
                fieldObject.source = ''; //Site source (ie: youtube, vimeo, dvids, etc.)
                fieldObject.license = ''; //License type (Public Domain, Creative Commons Attribution, Handout, Copyrighted etc.)

                //Optional, if left out, "Success" is assumed
                //Can also be "Fail" or "Caution"
                //This value determines what SFX and animation is played
                fieldObject.status = 'Success';

                message(fieldObject); //Pass your final fieldObject to this function, the extension will take care of the rest
            };

            //Code for every site is injected each time the extension is invoked
            //This check makes sure that only the correct site code is executed
            if (url.includes('[SITEURL]')) {
                sitename();
            }
        },
    });
    ```

3) Tests are currently broken, but at some point soon, there will be an extra step necessary to write tests for a new site that you've added.

##### PageStateMatchers

These can be confusing, here's a bit of guidance. The rule should be specific to a page where there's metadata to copy. So, for example, the css part of the Vimeo rule below makes sure that the user is on a page with a video on it and not on a search result page or some other page on the Vimeo site. There's a fair amount of trial and error in this process. Most of the bugs that I fix in the code at this point are when I discover some new way a site displays videos that means the rule either matches when it shouldn't or doesn't match when it should.

```js
stateMatcher: {
    pageUrl: {
        hostContains: 'vimeo.com',
    },
    css: ['div.player_area']
}
```

I recently came across an issue where the extension icon still remained blue even after I had navigated away from a compatible page. With the growing popularity of [single page applications](https://en.wikipedia.org/wiki/Single-page_application), many sites are now using [hash-based routing](https://reactarmory.com/answers/push-state-vs-hash-based-routing). This is great, but, per [this stackoverflow thread](https://stackoverflow.com/questions/23834021/using-declarativecontent-permission-hide-pageaction-after-content-change-using), Chrome does not refresh pageURL-based pageStateMatchers when location.hash is updated. So if that's the only pageStateMatcher rule type you're using and the site you're working with is updating location.hash, then the extension may appear active even after the user has navigated away from a compatible page. The solution is to also implement a css selector in your pageStateMatcher ruleset. Chrome seems to check those every time the DOM changes and will properly activate or deactivate the extension as the user navigates through an SPA. I haven't done this yet for every site, but I will be making an effort to update it in the future.

##### Error Messages

If you need to present the user with an error message or warning, check out [alerts.js](alerts.js), which is built on top of the [jQuery plainModal plugin](https://github.com/anseki/jquery-plainmodal). There should be comments in that file which will help you create your own warnings and errors. It also includes a way of copying multiple clips at once. See the [Media Express](sites/mediaexpress.js) function for how to handle multiple clips.

## History

-   2.2.9 - Changed videoblocks to storyblocks, tweaked newsmarket and pond5 due to site redesigns
-   2.2.8 - Fixed issues with UNICEF WeShare, added Getty Images, Getty Music, and Shutterstock
-   2.2.7 - Update to YT API
-   2.2.6 - Implemented privacy policy agreement, added UNICEF WeShare, extensive documentation updates
-   2.2.5 - Updated videoblocks for a site redesign
-   2.2.4 - Updated Vimeo and YouTube to comply with [new Chrome CORS policy for extensions](https://www.chromium.org/Home/chromium-security/extension-content-script-fetches)
-   2.2.3 - Fixed showstopper bug that caused the tool to not work after Chrome or the extension was restarted.
-   2.2.2 - Fixed some bugs in Reuters story selection, added support for clip-level Reuters restrictions.
-   2.2.1 - Fix for change in to Reuters restrictions
-   2.2.0 - Added clip selection functionality for Reuters Connect. Behind the scenes, streamlined the process for adding a new site. Sadly, this breaks testing for the time being.
-   2.1.0 - Added testing using Node, Google Puppeteer, Mocha, and Chai. A great deal of code refactoring to support the testing framework. Added a build process via Gulp to address some of the refactoring. Many bug fixes including for Ruptly, Flickr, VideoBlocks, and Pond5.
-   2.0.4 - Added support for Reuters Connect, rewrote Pond5 to accoomodate site redesign, added jquery and jquery.plainmodal to Git repository.
-   2.0.3 - Improved how MediaExpress multishot clips are reported. User gets more information now about the package link and the clip index)
-   2.0.2 - Reorganized and cleaned up folder structure a bit, fixed bug in Newsmarket
-   2.0.1 - Fixed an issue with identifying filenames for Unifeed footage
-   2.0.0 - Initial open source release, also significant redesign to allow for async API calls, animated icon, audio feedback for clicks, many other small changes and bug fixes
-   All versions prior to 2.0.0 are closed source and not available on GitHub.

## Credits

B-Roll Credit Copier is written and maintained by David Heidelberger. I'm a full-time video editor and producer and part-time software developer. I use this tool and many other proprietary ones every day at my day job on a documentary series on PBS. I'm available for workflow consultation and custom software solutions for your post-production workflow. To get in touch about a consult, or just to tell me how you're using the tool, I'd love to [hear from you](mailto:david.heidelberger@gmail.com).

The icon was designed by [Ivan Dotsenko](https://www.behance.net/idots). He's awesome and fast and you should give him a shout if you're looking for an icon. I did the icon animations myself, so if you hate those, don't blame Ivan!

The success and failure sound effects are from [Freesound](http://www.freesound.org).

-   [Scissor sound](http://freesound.org/people/Sclolex/sounds/236007/) by Sclolex, released as public domain
-   [Clunk sound](http://freesound.org/people/korgchops/sounds/170633/) by korgchops, released as public domain

## License<a name="license"></a>

B-Roll Credit Copier is released under an MIT license. However, I maintain ownership of the program name, _B-Roll Credit Copier_, and the icon artwork. In other words, the code is all free to use, but if you want to release your own version, please give it a different name and get your own icons.

Copyright 2017, David Heidelberger

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
