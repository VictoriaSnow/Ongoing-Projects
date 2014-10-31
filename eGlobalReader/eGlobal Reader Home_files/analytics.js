// analytics.js
// (C) 2013 Stoyan Kenderov for eGlobalReader
//


//<!-- GOOGLE Analytics -->

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-38635529-1']);
_gaq.push(['_trackPageview']);

(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();		


// EGR analytics

if (typeof EGR === 'undefined') { EGR = {};}

if (typeof EGR.Activity === 'undefined') {EGR.Activity = {};}


EGR.Activity.log = function(rec) {
	/* rec = object containing the following elements. (O) are optional:
	{ 	email(O):"bal@bla.com",
		ssid(O):"23424234",
		deviceID:"iOSapp-iPad-012323344" // will be stored on device first time the user logs in from that device
		devicetype:"iPad" or "Android Tablet" or "Chrombook" or "Chrome Browser" or "Firefox" or "anything else"
		cid(O):"CAIS-school-campaign-001" or "RDTYIG001"
		selector(O):"a" or "b" or "blabla"
		bookid(O):"1" or "201"
		lang(O):"CHI" // or "SPA" or any other ISO 693-2/B language code
		pageid(O):"4"
		timestamp: <UTC timestamp>
		eventtype:"book_loaded" // or "page_back", "page_forward", "word_click", "word_dbl_click", "page_audio_play", "pinyin_on", "pinyin_off" or ...
		descriptor: "10" //for page_back/, or "duckling" /for a clicked word/ or "x=345, y=560" /for screen_touch_coordinates/.
	} */

	var SERVER_ACTIVITYLOG = "https://www.eglobalreader.com/user/activitylog/";
	var MAXTIMEOUT= 6000;  		// milliseconds

/*	
	function logBuffer(rec) {
		// <<<<<<<<< We want to open local SQLLight DB and store records there (until we run out of space)
		// to make sure logging survices intermittend network erros.
		// Then we want to schedule a spool out of the buffer to a live connection. Perhaps an SetInterval() thing should take care of spooling, rather than trying to kick off 
	}
*/

	xhr = new XMLHttpRequest();
	if (!xhr) return;
	xhr.open("POST", SERVER_ACTIVITYLOG, true);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	var str = "";
	if (rec.email) str = str + "email="+rec.email +"&";
	if (rec.ssid) str = str + "SSID="+rec.ssid + "&";
	str = str + "deviceID="+rec.deviceID + "&";
	str = str + "devicetype="+rec.devicetype + "&";
	if (rec.cid) str = str + "CID="+rec.email + "&";
	if (rec.selector) str = str + "selector="+rec.selector + "&";
	if (rec.bookid) str = str + "bookid="+rec.bookid + "&";
	if (rec.lang) str = str + "lang="+rec.lang + "&";
	if (rec.pageid) str = str + "pageid="+rec.pageid + "&";
	str = str + "timestamp="+rec.timestamp + "&";
	str = str + "eventtype="+rec.eventtype + "&";
	if (rec.descriptor) str = str + "descriptor="+rec.descriptor;
	
	xhr.send(str);
	log("ACTIVITYLOG: " + str);
}



