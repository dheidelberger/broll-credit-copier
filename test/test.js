const puppeteer = require('puppeteer');
const path = require('path');
const fs = require("fs");
var _ = require('lodash');
const expect = require('chai').expect;
const rootFolder = path.join(__dirname,'..');
const libsFolder = path.join(rootFolder,"libs");

//All the expected results are stored as JSON in this file. Helps to clean up the test.js file a bit
let testResultsPath = path.join(rootFolder,"test-helpers","test-data.json");
let testResults = JSON.parse(fs.readFileSync(testResultsPath));


var loginsPath = path.join(rootFolder,"test-helpers","logins.json");
let logins = JSON.parse(fs.readFileSync(loginsPath));

let headless = false;

//Opts is an optional options object (say that five times fast!)
//Allowed keys:
//  bool expectError: must be true if we expect the test to bring up a modal
//  Object userSessions: an object containing {browser, page}, puppeter Browser and Page objects. Use this when logging in before running the test
//  String waitSelector: a string used as an optional selector for a waitFor. Only used if the user has passed in a session
//  bool printResult: true if you want to print results 
async function testPage (url,opts) {

  var expectError = false;
  var userSessionSet = false;
  var hasWaitSelector = false;
  
  //Set values if the user has specified them
  if (opts) {

    expectError = opts.expectError || false;
    
    if (opts.userSession) {
      userSessionSet = true;
    }

    if (opts.waitSelector) {
      hasWaitSelector = true;
    }

  }

  var browser,page;
  if (!userSessionSet) {
    //Launch the browser - headless can be false to view the browser
    browser = await puppeteer.launch({headless:headless});  
    page = await browser.newPage();
    await page.goto(url,{waitUntil: 'load'});
  } else {
    
    //We've gotten the session from the user, probably due to a login
  
    browser = opts.userSession.browser;
    page = opts.userSession.page;
    
    await page.goto(url);

    if (hasWaitSelector) {
      await page.waitForSelector(opts.waitSelector);
    }
    
  }

  


  //Inject all the things 
  await page.evaluate(fs.readFileSync(path.join(libsFolder,'jquery-1.11.3.min.js'), 'utf8'));
  await page.evaluate(fs.readFileSync(path.join(libsFolder,'jquery.plainmodal.min.js'), 'utf8'));
  await page.evaluate(fs.readFileSync(path.join(rootFolder,'apikeys.js'), 'utf8'));
  await page.evaluate(fs.readFileSync(path.join(rootFolder,'globals.js'), 'utf8'));
  await page.evaluate(fs.readFileSync(path.join(rootFolder,'alerts.js'), 'utf8'));
  
  //This file inits a few variables that tells the contentscript it's in test mode
  await page.evaluate(fs.readFileSync(path.join(rootFolder,'test-helpers','initTestingMode.js'), 'utf8'));
  
  //Inject the contentscript. When it's done, it will append an invisible div to the dom
  //The next line waits for that div to appear
  await page.evaluate(fs.readFileSync(path.join(rootFolder,'contentscript.js'), 'utf8'));
  await page.waitForSelector('div.broll-credit-copier-result');

  //Wait for the modal div that tells us an error has happened
  //Only wait if expectError was set when this function was called 
  let errs = {};
  if (expectError) {
    await page.waitForSelector('div#creditCopy_modal');
    
    //Evaling this script gets back any errors
    let pageErrs = await page.evaluate(() => {
      return pageErrors
    });

    errs = pageErrs;
    
  }
  
  //By evaluating this script, we can pull the message from the page's context
  let message = await page.evaluate(() => {
    
          return returnMessage
      });
  
  var returner = {message,errs};

  //Uncomment the line below to get a JSON formatted string of the expected result of any given call
  //This result can then be pasted into test-data.json and used for future tests
  //console.log(JSON.stringify(returner));

  await browser.close();
  return returner;
}

async function loginReutersConnect() {
  var browser = await puppeteer.launch({headless:headless});
    
  //New tab and load page
  var page = await browser.newPage();
  await page.goto("https://www.reutersconnect.com/",{waitUntil: 'load'});
  await page.waitForSelector('#login');

  await page.type('input#login',logins.reutersConnect.username);
  await page.type('input#password',logins.reutersConnect.password);
  await page.click('button[data-qa-component=login-submit]');
  
  await page.waitFor(1000);

  return {browser,page}
  
}


async function loginRuptly() {
  var browser = await puppeteer.launch({headless:headless});
    
  //New tab and load page
  var page = await browser.newPage();
  await page.goto("https://ruptly.tv/home",{waitUntil: 'load'});
  await page.waitForSelector('nav.navbar');
  //('nav.navbar')[0].querySelectorAll('ul.navbar-right')[0].querySelectorAll('li a')[1]
  await page.click('#main-navbar-collapse > ul.nav.navbar-nav.navbar-right > li:nth-child(2) > a');
  await page.type('input#login-username',logins.ruptly.username);
  await page.type('#ngdialog1 > div.ngdialog-content > form > div:nth-child(2) > div > input',logins.ruptly.password);
  await page.click('#ngdialog1 > div.ngdialog-content > form > div:nth-child(3) > div > button');
  
  await page.waitFor(1000);

  return {browser,page}
  
  
  
}


describe('Page Tests',function(){
  this.timeout(0);
  var expectErrorOpt = {expectError: true};
  
  describe('YouTube', function() 
  {

    it('Normal - https://www.youtube.com/watch?v=_IOnZfcV6zY', async function() {
      let msg = await testPage('https://www.youtube.com/watch?v=_IOnZfcV6zY');
      expect(msg).to.deep.equal(testResults.youtube.normal);
    });
    
    it('Creative Commons Warning - https://www.youtube.com/watch?v=_EAzoGS33lk', async function() {
      let msg = await testPage('https://www.youtube.com/watch?v=_EAzoGS33lk',expectErrorOpt);
      expect(msg).to.deep.equal(testResults.youtube.ccwarning);
    });

    it('SD Warning - https://www.youtube.com/watch?v=CwbPkcHA4HU', async function() {
      let msg = await testPage('https://www.youtube.com/watch?v=CwbPkcHA4HU',expectErrorOpt);
      expect(msg).to.deep.equal(testResults.youtube.sdwarning);
    });
    
    it('All Warnings - https://www.youtube.com/watch?v=cpPABLW6F_A', async function() {
      let msg = await testPage('https://www.youtube.com/watch?v=cpPABLW6F_A',expectErrorOpt);
      expect(msg).to.deep.equal(testResults.youtube.allwarnings);
    })

  });
  
  describe('DVIDS',function() { 
   
    it('One Creator - https://www.dvidshub.net/video/612943/doorstep-nato-secretary-general',async function() {
      let msg = await testPage('https://www.dvidshub.net/video/612943/doorstep-nato-secretary-general');
      expect(msg).to.deep.equal(testResults.dvids.oneCreator);
    });

    it('Two Creators - https://www.dvidshub.net/video/603044/lafayette-escadrille-memorial-day-ceremony-2018-2',async function() {
      let msg = await testPage('https://www.dvidshub.net/video/603044/lafayette-escadrille-memorial-day-ceremony-2018-2');
      expect(msg).to.deep.equal(testResults.dvids.twoCreators);
    });

  });

  describe('Vimeo',function() {  
   
    it('Normal - https://vimeo.com/59674991',async function() {
      let msg = await testPage('https://vimeo.com/59674991');
      expect(msg).to.deep.equal(testResults.vimeo.normal);
    });

    it('Creative Commons Warning - https://vimeo.com/62959319',async function() {
      let msg = await testPage('https://vimeo.com/62959319',expectErrorOpt);
      expect(msg).to.deep.equal(testResults.vimeo.ccwarning);
    });

    it('SD Warning - https://vimeo.com/27247288',async function() {
      let msg = await testPage('https://vimeo.com/27247288',expectErrorOpt);
      expect(msg).to.deep.equal(testResults.vimeo.sdwarning);
    });
       
    it('All Warnings - https://vimeo.com/406',async function() {
      let msg = await testPage('https://vimeo.com/406',expectErrorOpt);
      expect(msg).to.deep.equal(testResults.vimeo.allwarnings);
    });

    it('Private - https://vimeo.com/288265380/e4bfd7327f',async function() {
      let msg = await testPage('https://vimeo.com/288265380/e4bfd7327f',expectErrorOpt);
      expect(msg).to.deep.equal(testResults.vimeo.private);
    });

  });

  describe('VideoBlocks',function() {
     
    it('Normal - https://www.videoblocks.com/video/business-buildings-company-glass-architecture-aerial-view-s4hgjsain20mjqn',async function() {
      let msg = await testPage('https://www.videoblocks.com/video/business-buildings-company-glass-architecture-aerial-view-s4hgjsain20mjqn');
      expect(msg).to.deep.equal(testResults.videoblocks.normal);
    });

    it('Marketplace - https://www.videoblocks.com/video/fast-compilation-of-paris-attack-and-breaking-news-reports-7luhzun',async function() {
      let msg = await testPage('https://www.videoblocks.com/video/fast-compilation-of-paris-attack-and-breaking-news-reports-7luhzun', expectErrorOpt);
      expect(msg).to.deep.equal(testResults.videoblocks.marketplace);
    });

  });

  describe('APArchive',function() {
   
    it('Normal - http://www.aparchive.com/metadata/China-MOFA/a79a5a7b57fb63fabd4e4db14f6e18d3',async function() {
      let msg = await testPage('http://www.aparchive.com/metadata/China-MOFA/a79a5a7b57fb63fabd4e4db14f6e18d3');
      expect(msg).to.deep.equal(testResults.aparchive.normal);
    });

  });

  describe('APImages',function() {
   
    it('Normal - http://www.apimages.com/metadata/Index/China-Africa/c0d5a0b6ba5b4b6aba8491f07b388fa5/13/0',async function() {
      let msg = await testPage('http://www.apimages.com/metadata/Index/China-Africa/c0d5a0b6ba5b4b6aba8491f07b388fa5/13/0');
      expect(msg).to.deep.equal(testResults.apimages.normal);
    });

  });

  describe('UNifeed',function() {
   
    it('Normal - https://www.unmultimedia.org/tv/unifeed/asset/2143/2143864/',async function() {
      let msg = await testPage('https://www.unmultimedia.org/tv/unifeed/asset/2143/2143864/');
      expect(msg).to.deep.equal(testResults.unifeed.normal);
    });

  });

  describe('Flickr',function() {

    var copyrightVariants = [
      {
        label: 'CC BY-NC-SA',
        site: 'https://www.flickr.com/photos/nimasadigh/12241249534'
      },
      {
        label: 'CC BY',
        site: 'https://www.flickr.com/photos/tlaurens/44019910211'
      },
      {
        label: 'CC BY-NC',
        site: 'https://www.flickr.com/photos/mastababa/326149154'
      },
      {
        label: 'CC BY-NC-ND',
        site: 'https://www.flickr.com/photos/looking4poetry/526740389'
      },
      {
        label: 'CC BY-SA',
        site: 'https://www.flickr.com/photos/lfphotos/1249296992'
      },
      {
        label: 'CC BY-ND',
        site: 'https://www.flickr.com/photos/hapal/3271040109'
      },
      {
        label: 'PD0',
        site: 'https://www.flickr.com/photos/ninara/16343274934'
      },
      {
        label: 'PD Mark',
        site: 'https://www.flickr.com/photos/158655717@N06/36893862911'
      },
      {
        label: 'Government',
        site: 'https://www.flickr.com/photos/statephotos/19669726821/'
      },
    ];

    copyrightVariants.forEach(function(aSite) {
      it(aSite.label+" - "+aSite.site,async function() {
        let msg = await testPage(aSite.site);
        expect(msg).to.deep.equal(testResults.flickr[aSite.label]);
      });
    });
      
    it('Copyright - https://www.flickr.com/photos/131021490@N02/41395323945',async function() {
      let msg = await testPage('https://www.flickr.com/photos/131021490@N02/41395323945',expectErrorOpt);
      expect(msg).to.deep.equal(testResults.flickr.copyright);
    });

  });
  

  describe('Freesound.org',function() {
   
    it('Public Domain - https://freesound.org/people/Sclolex/sounds/236007/',async function() {
      let msg = await testPage('https://freesound.org/people/Sclolex/sounds/236007/');
      expect(msg).to.deep.equal(testResults.freesound.pd);
    });
    
    it('CC Attribution - https://freesound.org/people/Iwiploppenisse/sounds/156031/',async function() {
      let msg = await testPage('https://freesound.org/people/Iwiploppenisse/sounds/156031/');
      expect(msg).to.deep.equal(testResults.freesound.cc);
    });

  });

  describe('Pond5',function() {
   
    it('Public Domain - https://www.pond5.com/stock-footage/44594242/marine-corps-discussing-during-council-war.html',async function() {
      let msg = await testPage('https://www.pond5.com/stock-footage/44594242/marine-corps-discussing-during-council-war.html');
      expect(msg).to.deep.equal(testResults.pond5.pd);
    });
    
    it('Pay Content - https://www.pond5.com/stock-footage/43113545/marine-ls3-robot-patrols-marines.html',async function() {
      let msg = await testPage('https://www.pond5.com/stock-footage/43113545/marine-ls3-robot-patrols-marines.html',expectErrorOpt);
      expect(msg).to.deep.equal(testResults.pond5.pay);
    });

  });

  describe('European Commission',function() {
   
    it('Normal - http://ec.europa.eu/avservices/video/player.cfm?sitelang=en&ref=I159743',async function() {
      let msg = await testPage('http://ec.europa.eu/avservices/video/player.cfm?sitelang=en&ref=I159743');
      expect(msg).to.deep.equal(testResults.ec.normal);
    });
  
  });

  describe('Newsmarket',function() {
   
    it('Normal - https://www.thenewsmarket.com/GLOBAL/Euro-NCAP/video/toyota-aygo---crash-tests-2014---with-captions/a/311d659e-f75f-45c7-ade1-5e9af5ca9a3e',async function() {
      let msg = await testPage('https://www.thenewsmarket.com/GLOBAL/Euro-NCAP/video/toyota-aygo---crash-tests-2014---with-captions/a/311d659e-f75f-45c7-ade1-5e9af5ca9a3e');
      expect(msg).to.deep.equal(testResults.newsmarket.normal);
    });
  
  });
  
  describe('Ruptly - No login',function() {
   
    it('Not logged in - https://ruptly.tv/vod/20180905-021',async function() {
      let msg = await testPage('https://ruptly.tv/vod/20180905-021',expectErrorOpt);
      expect(msg).to.deep.equal(testResults.ruptly.notloggedin);
    });
  
  });
  

  describe('Ruptly - Login', async function() {

    var mySession;

    this.beforeEach(async function() {
      mySession = await loginRuptly();
    });

    it('Normal - https://ruptly.tv/vod/20180905-033', async function() {
      let msg = await testPage('https://ruptly.tv/vod/20180905-033',{
        userSession: mySession,
        waitSelector: 'div.vod-meta'
      });
      expect(msg).to.deep.equal(testResults.ruptly.normal);    
    });

    it('Pay Clip - https://ruptly.tv/vod/20180905-026', async function() {
      let msg = await testPage('https://ruptly.tv/vod/20180905-026',{
        userSession: mySession,
        waitSelector: 'div.vod-meta',
        expectError: true
      });
      expect(msg).to.deep.equal(testResults.ruptly.payclip);    
    });
  
  });

  describe('ReutersConnect', async function() {

    var mySession;

    this.beforeEach(async function() {
      mySession = await loginReutersConnect();
    });

    var myWaitSelector = 'div[data-qa-component=points-button]';

    it('Normal - https://www.reutersconnect.com/all?id=tag%3Areuters.com%2C1915%3Anewsml_LVA4ZQSQF5TCVIG1LGEQEES2O1CD%3A2&share=true', async function() {
      let msg = await testPage('https://www.reutersconnect.com/all?id=tag%3Areuters.com%2C1915%3Anewsml_LVA4ZQSQF5TCVIG1LGEQEES2O1CD%3A2&share=true',{
        userSession: mySession,
        waitSelector: myWaitSelector
      });
      expect(msg).to.deep.equal(testResults.reutersconnect.normal);    
    });

    it('Points Clip - https://www.reutersconnect.com/all?id=tag%3Areuters.com%2C1915%3Anewsml_GM1EA5M19RO01%3A896790138&share=true', async function() {
      let msg = await testPage('https://www.reutersconnect.com/all?id=tag%3Areuters.com%2C1915%3Anewsml_GM1EA5M19RO01%3A896790138&share=true',{
        userSession: mySession,
        waitSelector: myWaitSelector,
        expectError: true
      });
      expect(msg).to.deep.equal(testResults.reutersconnect.points);    
    });
  
  });  

});