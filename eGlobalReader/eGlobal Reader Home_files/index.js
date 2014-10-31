/**
 * @module index.js - Angular module for index.html
 * @copyright (C) 2013-2014 Stoyan Kenderov
 *
 */
 
if (typeof EGR === 'undefined' || typeof EGR.Utils === "undefined") { 
	throw new Error("EGR.Index: Module EGR.Utils not found. Aborting");
}


var app = angular.module("Index",[]);
app.controller("indexCtrl",["$scope","$anchorScroll","$location", function($scope, $anchorScroll, $location) {
  
	$scope.scrollTo = function(el) {
		$location.hash(el);
		$anchorScroll();
	}

}]).run(function($location, $anchorScroll){
 // this is the solution for allowing a hash-tag URL to scroll directly to the "Sign-Up" part.
 // this works.
 $(document).ready(function() {
	 if(location.hash && location.hash.length>=1)
		{
			var path = location.hash;
			var potentialAnchor = path.substring(path.lastIndexOf("/")+1);
			if ($("#" + potentialAnchor).length > 0) {   // make sure this hashtag exists in the doc.                     
				location.hash = potentialAnchor;
			    $anchorScroll();
			}
		}
	 
 });

});