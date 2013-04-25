var dimensions = {width: 400, height: 500};

var map, overlay, markers = [];

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

function drawMap(element, data) {

	// Google Maps Setup
	////////////////////

	var styledMap = new google.maps.StyledMapType(styles,{name: "Styled Map"});

	var targetBounds = new google.maps.LatLngBounds(
		new google.maps.LatLng(40.881989,-74.047852),
		new google.maps.LatLng(40.682949, -73.906693)
	);

	var mapCenter = new google.maps.LatLng(40.72944585471527,-73.99366021156311);

	// var targetBounds = new google.maps.LatLngBounds();

	// $(data).each(function(index,value) {
	// 	var currentLocation = new google.maps.LatLng(value.location_lat, value.location_lng);
	// 	console.log(currentLocation);
	// 	targetBounds.extend(currentLocation);	
	// });

	var mapOptions = {
		streetViewControl: false,
		zoomControl: false,
		mapTypeControl: false,
		panControl: false,
		zoom: 12,
		maxZoom: 18,
		minZoom: 12,
		center: mapCenter
	};
	map = new google.maps.Map(document.getElementById('map'),mapOptions);	

 	map.mapTypes.set('map_style', styledMap);
  	map.setMapTypeId('map_style');


	overlay = new google.maps.OverlayView();
	overlay.draw = function() {};
	overlay.setMap(map);  	

	google.maps.event.addListener(map, 'idle', function() {
		console.log("New bounds");
		clearPoints();
		drawPoints(data);

	});  	

}

function clearPoints() {

    for (i in markers) {
      markers[i].setMap(null);
    }

}

function drawPoints(data) {

	// Google Maps Sites
	////////////////////
	
	var siteCircle = {
	    path: google.maps.SymbolPath.CIRCLE,
	    fillOpacity: 1.0,
	    fillColor: "#F6B83C",
	    strokeWeight: 0.0,
	    scale: 5.0
	};

	var pixels = [];

	$(data).each(function(index,value) {	

		var currentLocation = new google.maps.LatLng(value.location_lat, value.location_lng);

		if (map.getBounds().contains(currentLocation)) {
			var newCircle = new google.maps.Marker({
			        icon: siteCircle,
			        position: currentLocation
		    });
		    newCircle.setMap(map);
		    markers.push(newCircle);

			google.maps.event.addListener(newCircle, 'click', function() {
				showPoint(newCircle);
			});				    

			var pixel = overlay.getProjection().fromLatLngToContainerPixel(currentLocation);
			pixels.push(pixel);
		}

	});

	// Voronoi
	//////////

	var bbox = {xl:0,xr:dimensions.width,yt:0,yb:dimensions.height};	
	var voronoi = new Voronoi();
	var diagram = voronoi.compute(pixels, bbox);

	// Nodes
	////////

	var nodeCircle = {
	    path: google.maps.SymbolPath.CIRCLE,
	    fillOpacity: 1.0,
	    fillColor: "#B1F317",
	    strokeWeight: 0.0,
	    scale: 5.0
	};	

	$(diagram.vertices).each(function(index,value) {	


		if (value.x != 0 && value.x != dimensions.width && value.y != 0 && value.y != dimensions.height) {

			var currentLocation = 	overlay.getProjection().fromContainerPixelToLatLng(value);

			var newCircle = new google.maps.Marker({
			        icon: nodeCircle,
			        position: currentLocation
		    });
		    newCircle.setMap(map);
		    markers.push(newCircle);

			google.maps.event.addListener(newCircle, 'click', function() {
				showPoint(newCircle);
			});		    

		}

	});


	// Edges 
	////////

	$(diagram.edges).each( function (index, value) {

		//console.log(value);

		var startLocation = overlay.getProjection().fromContainerPixelToLatLng(value.va);
		var endLocation = overlay.getProjection().fromContainerPixelToLatLng(value.vb);

		var lineCoordinates = [
    		startLocation,
    		endLocation
  		];

		var edge = new google.maps.Polyline({
			path: lineCoordinates,
			strokeColor: "#99CCFF",
			strokeOpacity: 1.0,
			strokeWeight: 1
		});

		edge.setMap(map); 
		markers.push(edge); 		


	});	

}

function showPoint(marker) {
	var location = {
		latitude: marker.position.lat(),
		longitude: marker.position.lng()
	};
	
	$("#informationTitle").text("Point Information");
	$("#informationImage")
	.attr('src', "//maps.googleapis.com/maps/api/streetview" +
		"?size=308x120" +
		"&location=" + location.latitude + "," + location.longitude + 
		"&fov=120&sensor=false")
	.attr({width: 308, height: 120});
	$("#informationLink")
	.attr('href', "//maps.google.com/?q=" + location.latitude + "," + location.longitude);
	$("#informationLatitude").text(location.latitude);
	$("#informationLongitude").text(location.longitude);
	$("#informationAddress").text("");
	$("#information").fadeIn('slow');

	// Lookup Data

	var url = "//maps.googleapis.com/maps/api/geocode/json" +
	"?latlng=" + location.latitude + "," + location.longitude + 
	"&sensor=false"
	$.ajax({ url: url, success: function(data) {

		var html = (data.results[0].formatted_address).replace(",","<br/>");
		$("#informationAddress").html(html);
	}})

}