var map, overlay;
var markers = [];

var styles = [{
	"elementType": "geometry",
	"stylers": [
	{ "visibility": "simplified" }
	]
},{
	"elementType": "labels",
	"stylers": [
	{ "visibility": "off" }
	]
},{
	"featureType": "water",
	"stylers": [
	{ "color": "#5d6e74" }
	]
},{
	"featureType": "transit",
	"stylers": [
	{ "visibility": "off" }
	]
},{
	"featureType": "poi",
	"stylers": [
	{ "visibility": "off" }
	]
},{
	"featureType": "landscape",
	"stylers": [
	{ "color": "#575757" }
	]
},{
	"featureType": "road",
	"stylers": [
	{ "weight": 0.3 },
	{ "color": "#a0a0a0" }
	]
}];

var siteCircle = {
    path: google.maps.SymbolPath.CIRCLE,
    fillOpacity: 1.0,
    fillColor: "#F6B83C",
    strokeWeight: 0.0,
    scale: 5.0
};

var userCircle = {
    path: google.maps.SymbolPath.CIRCLE,
    fillOpacity: 1.0,
    fillColor: "#17B1F3",
    strokeWeight: 0.0,
    scale: 5.0
};

var nodeCircle = {
    path: google.maps.SymbolPath.CIRCLE,
    fillOpacity: 1.0,
    fillColor: "#B1F317",
    strokeWeight: 0.0,
    scale: 5.0
};	

function buildMap(element, mapCenter ) {

	var mapOptions = {
		streetViewControl: false,
		zoomControl: false,
		mapTypeControl: false,
		panControl: false,
		zoom: 13,
		maxZoom: 18,
		minZoom: 1,
		center: mapCenter
	};
	map = new google.maps.Map(document.getElementById('map'),mapOptions);	

	var styledMap = new google.maps.StyledMapType(styles,{name: "Styled Map"});
 	map.mapTypes.set('map_style', styledMap);
  	map.setMapTypeId('map_style');

	overlay = new google.maps.OverlayView();
	overlay.draw = function() {};
	overlay.setMap(map);  	

}


function clearPoints() {

    for (var i in markers) {
      markers[i].setMap(null);
    }

}