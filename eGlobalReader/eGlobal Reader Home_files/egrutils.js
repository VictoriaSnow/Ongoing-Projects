/**
 * @module egrutils.js - implements the client side utlity functions for login, library, signup etc.
 *
 * @copyright (C) 2013-14 Stoyan Kenderov
 
 continueToLibrary(qs) 
 deleteLocalCredentials() 
 getLocalCredentials()
 getQueryString()
 isTouchDevice()
 setLocalCredentials (obj, max_age)
 logOut()
 langFullName()
*/


if (typeof EGR === 'undefined') { EGR = {};}


EGR.Utils = (function() {

//	"use strict";

	/* -----------------------------------
	 * Private vars
	 */

	var COOKIE = "EGRSID";  // cookie format = "<userid>:<language>"
	var lang_dictionary = {"ENG":"English",
						   "SPA":"Spanish",
						   "CHI":"Chinese",
						   };
						   
	var plans = {
				 "1Y99USD30USERS":{
	 				plan_id:"1Y99USD30USERS",
	 				name: "one year subscription to eGlobalReader for up to 30 users",
	 				price: 9900,
	 				currency: "USD",
	 				duration:365,
	 				gratisperiod: 61,
	 			  },
				 };


	/* -----------------------------------
	 * Private interface functions
	 */
	
	/**
	 * @method createCookie - sets a cookie with a max_age interval of validity from the current moment
	 * @param {string} name - cookie name
	 * @param {string} value - ready to store cookie value
	 * @param {integer} max_age - how long should the cookie live in seconds. If NULL or 0 - the cookie will be a session cookie. Deleted at browser close.
	 */
	function createCookie(name, value, max_age) {
		var tmp = "";
		if (max_age) {
			tmp = "; max-age="+max_age;
		}
		
		document.cookie = name+"="+value+tmp+"; path=/";
	}
	
	
	/**
	 * @method readCookie - read a cookie with a given name
	 * @return {string} - the string stored in the cookie. Not URIdecoded !!! Caller must know how to decode.
	 */
	function readCookie(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	}


	/**
	 * @method eraseCookie - delete a cookie with a given name
	 * @param {string} name - cookie name
	 */
	function eraseCookie(name) {
		createCookie(name,"",0);
	}


	/*---------------------------
	* Public interface
	*/
	return {
		// change those to https://www.eglobalreader.com/v2/... for production
		SERVER_USER_LOGIN: "http://dev.eglobalreader.com:8888/v2/user/login/",
		SERVER_PASSWORD_RESEST: "http://dev.eglobalreader.com:8888/v2/user/resetpassword/",
		SERVER_CHANGE_PASSWORD: "http://dev.eglobalreader.com:8888/v2/user/changepassword/",
		SERVER_CREATE_WITH_CODE: "http://dev.eglobalreader.com:8888/v2/school/createwithcode/",
		SERVER_CREATE_WITH_CC: "http://dev.eglobalreader.com:8888/v2/school/createwithcc",
		SERVER_GET_BOOKS: "http://dev.eglobalreader.com:8888/v2/user/getbooks",
		SERVER_GET_READER_SETTINGS: "http://dev.eglobalreader.com:8888/v2/school/getreadersettings",
		SERVER_REMOVE_FROM_CODE: "http://dev.eglobalreader.com:8888/v2/school/removefromcode",
		SERVER_UPDATE_READER_SETTINGS: "http://dev.eglobalreader.com:8888/v2/school/updatereadersettings",
		SERVER_ADD_TO_CODE: "http://dev.eglobalreader.com:8888/v2/school/addtocode",
		SERVER_ACTIVITYLOG: "http://dev.eglobalreader.com:8888/v2/user/activitylog/",
		SERVER_USER_GET_READERSETTINGS: "http://dev.eglobalreader.com:8888/v2/user/getreadersettings/",
		SERVER_ANALYTICS: "http://dev.eglobalreader.com:8888/v2/user/teacheranalytics/",

		/**
		 * @method isSupportedBrowser - checks if the browser we are runnion on is a supported one
		 * @returns {boolean} - true: supported, false:unsupported
		 */		
		isSupportedBrowser: function() {
			return (/(Safari|Chrome|AppleWebKit)/.test(navigator.userAgent));  // the test for mobile Safari and Chrome should be strenghtened
		},
		
		/**
		 * @method getQueryString - parse and get parameters from the querystring - such as "cid" and a "selector",
		 *       but there may also be a "client" var that is set to "iOSApp" or "AndroidApp" and a "lang" var set to "CHI" or "SPA".	
		 * @returns {array} - associative array of the querystring variables that were found in the URI
		 */
		getQueryString: function() { 
			var assoc  = {};
			var decode = function (s) { return decodeURIComponent(s.replace(/\+/g, " ")); };  // is this going to replace
			var queryString = location.search.substring(1); 
			var keyValues = queryString.split('&'); 
			
			for(var i in keyValues) { 
				var key = keyValues[i].split('=');
				if (key.length > 1) {
				  assoc[decode(key[0]).toLowerCase()] = decode(key[1]);
				} else {
				  assoc[decode(key[0]).toLowerCase()] ="";  
				}
			} 	
			return assoc; 
		},
	

		/**
		 * @method getLocalCredentials - reads credentials locally stored in the COOKIE. The elements of the cookie are:
		 *			"usertoken" : <contains the encrypted SSID for this user>
		 *			“email: <user email>
		 *          "deviceId: <previously generated unique deviceID to helps us identify devices that the user is reading from.
		 *			"expiry": <UTC time in millisec of expiry for the encrypted SSID token. Equal to last day of validity for the user's subscription>
		 *			“lang”: languange that this user has in their EGR_user_id. Used to select initial communication language.
		 *			"lang_PRIM”: <primary language for this user's books>
		 *			“lang_ALT”: <second language for this user's books>
		 *			“grade”: <the user’s grade level from EGR_subscriptions>
		 *			“settings”: <the reader settings string for this user>
		 *			“codeowner”:0 = not a code owner, 1= code owner
		 * 								
		 * @returns {object} - credentials object containing the attributes found in the cookie.         
		 */
		getLocalCredentials: function(){
			// get the cookie for this user and parse it.
			var cookie = readCookie(COOKIE);
			if (cookie) {
				var parts = cookie.split(":");
				return {usertoken:decodeURIComponent(parts[0]), 		// [0] = usertoken
						email:decodeURIComponent(parts[1]),				// [1] = email
						deviceid:decodeURIComponent(parts[2]),			// [2] = deviceid
						expiry:decodeURIComponent(parts[3]),			// [3] = subsription expiry
						lang:decodeURIComponent(parts[4]),				// [4] = lang
						lang_PRIM:decodeURIComponent(parts[5]),			// [5] = lang_PRIM
						lang_ALT:decodeURIComponent(parts[6]),			// [6] = lang_ALT
						grade:decodeURIComponent(parts[7]),				// [7] = grade
						settings:decodeURIComponent(parts[8]), 			// [8] = settings
						codeowner:decodeURIComponent(parts[9]) 			// [9] = codeowner
						};
			}
			return null;
		},
	
		/**
		 * @method setLocalCredentials - stores an the user credentials in COOKIE. If the max_age interval of life for the cookie is > the subscription expiry, 
		 *        the subscription expiry timeframe will be used instead of max_age.
		 * 		  Every time it's called it generates a new deviceID.
		 *
		 *        The Local Credentials COOKIE contains:
		 *			"usertoken" : <contains the encrypted SSID for this user>
		 *			“email: <user email>
		 *          "deviceId: <previously generated unique deviceID to helps us identify devices that the user is reading from.
		 *			"expiry": <UTC time in millisec of expiry for the encrypted SSID token. Equal to last day of validity for the user's subscription>
		 *			“lang”: languange that this user has in their EGR_user_id. Used to select initial communication language.
		 *			"lang_PRIM”: <primary language for this user's books>
		 *			“lang_ALT”: <second language for this user's books>
		 *			“grade”: <the user’s grade level from EGR_subscriptions>
		 *			“settings”: <the reader settings string for this user>
		 *			“codeowner”:0 = not a code owner, 1= code owner
		 * 	
		 * @param {object} obj - an object with the user data, typically obtained via the login API
		 * @param {integer} max_age - interval in seconds for which the credentials should be stored
		 */
		setLocalCredentials: function(obj, max_age) {
			var cookieVal = encodeURIComponent(obj.usertoken) + ":"  					// [0] = usertoken
						+ encodeURIComponent(obj.email) + ":"							// [1] = email
						+ encodeURIComponent("web" + (new Date()).getTime()) + ":"    	// [2] = deviceid
						+ encodeURIComponent(obj.expiry) + ":"   						// [3] = subsription_expiry
						+ encodeURIComponent(obj.lang) + ":"     						// [4] = lang
						+ encodeURIComponent(obj.lang_PRIM) + ":"      					// [5] = lang_PRIM
						+ encodeURIComponent(obj.lang_ALT) + ":"   						// [6] = lang_ALT
						+ encodeURIComponent(obj.grade) + ":"							// [7] = grade
						+ encodeURIComponent(obj.settings) + ":"						// [8] = settings
						+ encodeURIComponent(obj.codeowner);							// [9] = codeowner
						
			if ((new Date()).getTime() + max_age * 1000 > obj.expiry) {
				// we are being asked to set the cookie lifespan to more than the subscription lifespan. We will use the subscription lifespan. 
				createCookie(COOKIE, cookieVal, Math.ceil((obj.expiry - (new Date()).getTime())/1000));
			} else {
				createCookie(COOKIE, cookieVal, max_age);				
			}

	
		},


		/**
		 * @method deleteLocalCredentials - deletes the user credentials COOKIE. 
		 *									This will essentially force a re-direct to login next time the user attempts a server operation
		 */
		deleteLocalCredentials: function() {
		    eraseCookie(COOKIE);
		},
	
	
		/**
		 * @method continueToLibrary - this is our standard way to get the library page
		 * @param {string} - optional querystring to pass on to the library URI. If none the function will pass on the current querystring. Must contain "?" as first char
		 */
		continueToLibrary: function (qs) {
			var lqs = qs ? qs : document.location.search;
			document.location.href = "library.html"+lqs;
		},
		
		/**
		 * @method goHome - this is our standard way to get the homepage
		 * @param {string} - optional querystring to pass on to the library URI. If none the function will pass on the current querystring. Must contain "?" as first char
		 */
		goHome: function (qs) {
			var lqs = qs ? qs : document.location.search;
			document.location.href = "index.html"+lqs;
		},

		/**
		 * @method changePass - this is our standard way to get the password change page
		 * @param {string} - optional querystring to pass on to the URI. If none the function will pass on the current querystring. Must contain "?" as first char
		 */

		changePass: function (qs) {
			var lqs = qs ? qs : document.location.search;
			document.location.href = "changepass.html" + lqs;
		}, 
		
		/** 
		 * @ method continueToThankYouForPurchase - our standard way of getting to the confirmation site. It REQUIRES search string parameters
		 * @ param {string} qs - query string parameters {email=, finalprice=, freeperiod=, schoolcode=}
		 */		
		continueToThankYouForPurchase: function (qs) {
			var lqs = qs ? qs : document.location.search;
			document.location.href = "thankyou.html" + lqs;
		},
		
		goToAnalytics: function (qs) {
			var lqs = qs ? qs : document.location.search;
			document.location.href = "analytics/index.html" + lqs;			
		},

		goToManageAccounts: function (qs) {
			var lqs = qs ? qs : document.location.search;
			document.location.href = "manageaccounts.html" + lqs;			
		},
		
		/** 
		 * @ method isTouchDevice - finds out if the app is running on a device that supports touch (phone, tablet)
		 * @return {boolean} - true: we are running on a touch enabled device
		 */
		isTouchDevice : function () {
	  		return (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) && (typeof document.body.click === "function");
		},
		
		
		/**
		 * @method logOut - logs the user out by deleting the locally stored credentials and send them to the login screen.
		 * @param {string} base - typically location.origin if the login.html is a at a different depth of the directory structure
		 */
		logOut : function(base) {
			EGR.Utils.deleteLocalCredentials();
			if (base) {
				document.location.href = base+"/login.html";	
			} else {
				document.location.href = "login.html";
			}
		},
		
		/** 
		 * @method langFullName - returns the long name of a language (e.g. "Spanish") for a short languange code give to the function (e.g. "SPA")
		 * @param {string} lang_code - short code for a language (e.g. ENG, SPA, CHI)
		 * returns {string} - the long name for the language
		 */
		langFullName : function (lang_code) {
			return lang_dictionary[lang_code];
		},
		
		/** 
		 * @method getPlan - returns the list of plan attributes for a given plan_id.
		 * @param {string} id - the ID of the plan as is known to the backend/database
		 * returns {object} - the plan attributes {plan_id, name, duration (in days), gratisperiod (in days), price (in cents), currency moniker}
		 */
		getPlan : function (id) {
			if (plans[id])
				return plans[id];
			else
				throw new Error("EGR.Utils: Plan "+id+" not found!");
		},

		/** 
		 * @method splitLangPair - returns an associateive array {PRIM:"...", ALT:"..."} from the language pair passed in as parameter.
		 * @param {string} id - a language combination (such as "ENG-SPA", or just "ENG-ENG")
		 * returns {object} - {"PRIM":..., "ALT":...}
		 */

		splitLangPair : function (id) {
		
			var res = {};
			
			if (id) {
			
				var tmp = id.split("-");
				
				res["PRIM"] = tmp[0];
				
				if (tmp.length < 2) {
					res["ALT"] = tmp[0]; // if we got only one language in the pair "ENG", then set ALT to the same language as PRIM
				} else {
					res["ALT"] = tmp[1];
				}

				return res;	
			}
			else
				throw new Error("EGR.Utils: Language combination "+id+" not found!");
		},
		
	} /* Public interface */
})();