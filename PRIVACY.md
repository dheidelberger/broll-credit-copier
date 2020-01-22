### Intro

Please read this privacy disclosure carefully and agree to it prior to using this extension. You may also read a blanket privacy policy for all my extensions [here](https://github.com/dheidelberger/extension-privacy-policy).

This extension collects no data, personal or otherwise, however, it does handle data which Google deems to be sensitive. As such, [Google requires](https://developer.chrome.com/webstore/user_data) this privacy statement.

### Activation

This extension is only activated when you click on it (or use its keyboard shortcut). [Chrome's Declarative Content API](https://developer.chrome.com/extensions/declarativeContent), not the extension itself, determines when the extension is clickable. As such, this extension receives no information about a page you are visiting until you click its icon.

### Data Collection

No data is collected by this extension or sent to any remote server with the following exception(s):

*   An encrypted HTTPS API call is made to the [Vimeo](https://developer.vimeo.com), [YouTube](https://developers.google.com/youtube/v3), Getty, or Reuters Connect API when this extension is used on one of those sites in order to provide metadata for videos on those sites that can't be found on the page itself. The URL of the video on the current page is transmitted. There is some personal information the third party receives in the [request header](https://developer.mozilla.org/en-US/docs/Glossary/Request_header), most notably your [IP address](https://computer.howstuffworks.com/internet/basics/what-is-an-ip-address.htm) and [user agent string](https://developer.chrome.com/multidevice/user-agent). Some companies will use information like that to develop a “[browser fingerprint](https://pixelprivacy.com/resources/browser-fingerprinting/)" that can probably track and personally identify you. Unfortunately, this is not something that I or my extensions have control over. If this is a concern for you, consider [using a VPN](https://www.howtogeek.com/133680/htg-explains-what-is-a-vpn/) to mask your IP address.

### Data Storage

This extension will also periodically ask for your initials. This information is not stored by the extension itself, but it is synced across your personal Chrome installs and stored on Google’s servers using [Google Chrome's Storage API](https://developers.chrome.com/extensions/storage).

### Changes to this Policy

You are required to agree to this privacy policy every time a new version of the Credit Copier is released. If there are changes made to this privacy policy, they will be wrapped into a new version so you will be presented with changes as they are made.

### Source Code

The B-Roll Credit Copier is open-source and the complete source code may be [viewed on GitHub](https://github.com/dheidelberger/broll-credit-copier/).