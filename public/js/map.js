var map, overlay;
var markers = [];

var styles = [
{
	"stylers": [
	{ "visibility": "off" }
	]
},
{
	"featureType": "landscape.natural",
	"elementType": "geometry",
	"stylers": [
	{ "visibility": "simplified" },
	{ "color": "#17191C" }
	]
},
{
	"featureType": "administrative",
	"elementType": "geometry.stroke",
	"stylers": [
	{ "visibility": "on" },
	{ "color": "#5C6269" },
	{ "weight": 1}
	]
},
{
	"featureType": "road.local",
	"elementType": "geometry.fill",
	"stylers": [
	{ "visibility": "on" },
	{ "color": "#090A0B" }
	]
},
{
	"featureType": "road.local",
	"elementType": "geometry.stroke",
	"stylers": [
	{ "visibility": "on" },
	{ "color": "#2c3033" }
	]
},
{
	"featureType": "road.arterial",
	"elementType": "geometry.fill",
	"stylers": [
	{ "visibility": "on" },
	{ "color": "#2c3033" }
	]
},
{
	"featureType": "road.highway",
	"elementType": "geometry.fill",
	"stylers": [
	{ "visibility": "on" },
	{ "color": "#2c3033" }
	]
},
{
	"featureType": "water",
	"elementType": "geometry",
	"stylers": [
	{ "visibility": "simplified" },
	{ "color": "#202930" }
	]
},
{
	"featureType": "road",
	"elementType": "labels.text.fill",
	"stylers": [
	{ "visibility": "on" },
	{ "color": "#5C6269" }
	]

},
{
	"featureType": "administrative",
	"elementType": "labels.text.fill",
	"stylers": [
	{ "visibility": "on" },
	{ "color": "#5C6269" }
	]

},
{
	"featureType": "water",
	"elementType": "labels.text.fill",
	"stylers": [
	{ "visibility": "on" },
	{ "color": "#090A0B" }
	]

},
{
	"featureType": "road.local",
	"elementType": "labels.icon",
	"stylers": [
	{ "visibility": "simplified" },
	{ "color": "#2c3033" }      
	]
}

];

var siteCircle = {
	path: google.maps.SymbolPath.CIRCLE,
	fillOpacity: 1.0,
	fillColor: "#ff9431",
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