"use strict";

var userCoordinates;
var mapData;

function userMap() {

	$.ajax({
		url: '/json/',
		dataType: "json",
		success: function(data) {
			drawMap('map',data);

		}
	});

}

function friendMap(access_token) {

	var userCheckinsURL = "https://api.foursquare.com/v2/users/self/checkins" +
		"?oauth_token=" + access_token +
		"&limit=1"+
		"&v=20130424";

	var checkinsRecentURL = "https://api.foursquare.com/v2/checkins/recent"+
		"?oauth_token=" + access_token +
		"&limit=100"+		
		"&afterTimestamp=" + Math.round((Date.now() / 1000) - (24 * 60 * 60) ) +
		"&v=20130424";			

	$.ajax({
		url: userCheckinsURL,
		dataType: "json",
		success: function(data) {

			userCoordinates = new google.maps.LatLng(
				data.response.checkins.items[0].venue.location.lat,
				data.response.checkins.items[0].venue.location.lng);

			$.ajax({
				url: checkinsRecentURL,
				dataType: "json",
				success: function(data) {
					drawMap('map',data.response.recent);

				}
			});

		}
	});
}



function drawMap(element, data) {

	mapData = data;


	// Map Center
	/////////////

	var mapBounds, mapCenter;

	if (!userCoordinates) {

		mapBounds = new google.maps.LatLngBounds(
			new google.maps.LatLng(40.881989,-74.047852),
			new google.maps.LatLng(40.682949, -73.906693)
		);

		mapCenter = new google.maps.LatLng(40.72944585471527,-73.99366021156311);

	} else {

		var mapBounds = new google.maps.LatLngBounds();
		$(data).each(function(index,value) {
			var coordinates = new google.maps.LatLng(value.venue.location.lat, value.venue.location.lng);

			var distance = google.maps.geometry.spherical.computeDistanceBetween(coordinates, userCoordinates);
			if (distance < 10000 && value.user.relationship != "self") {
				mapBounds.extend(coordinates);
			}

		});

		mapCenter = mapBounds.getCenter();
	}

	//

		buildMap('map', mapCenter);

	//

	google.maps.event.addListener(map, 'zoom_changed', function() {
		clearPoints();
	}); 

	// google.maps.event.addListener(map, 'dragstart', function() {
	// 	clearPoints();
	// }); 

	google.maps.event.addListener(map, 'idle', function() {
		//console.log("New bounds.")	
		clearPoints();	
		drawPoints(data);

	});  	

}

function drawPoints(data) {

	// Google Maps Sites
	////////////////////


	var pixels = [];

	$(data).each(function(index,value) {	

		var isUser = false;
		var marker = siteCircle;

		if (!value.user || (value.user && value.user.relationship != "self")) {
			isUser = false;
			marker = siteCircle;
		} else {
			isUser = true;
			marker = userCircle;
		}


		var location = (value.venue) ?
			value.venue.location :
			{lat: value.location_lat, lng: value.location_lng};

		var coordinates = new google.maps.LatLng(location.lat, location.lng);

		if (map.getBounds().contains(coordinates)) {
			var newCircle = new google.maps.Marker({
			        icon: marker,
			        position: coordinates,
			        index : index
		    });
		    newCircle.setMap(map);
		    markers.push(newCircle);

			google.maps.event.addListener(newCircle, 'click', function() {
				showPoint(newCircle);
			});				    

			if (!isUser) {
				var pixel = overlay.getProjection().fromLatLngToContainerPixel(coordinates);
				pixels.push(pixel);
			}
		}

	});

	// Voronoi
	//////////

	var boundingBox = {xl:0,xr:$('#map').width(),yt:0,yb:$('#map').height()};	
	var voronoi = new Voronoi();
	var diagram = voronoi.compute(pixels, boundingBox);

	// Nodes
	////////

	$(diagram.vertices).each(function(index,value) {	


		if (value.x != 0 && value.x != $('#map').width() && value.y != 0 && value.y != $('#map').height()) {

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

		if (value.va.x == value.vb.x || value.va.y == value.vb.y) return;

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

	var markerData = mapData[marker.index];

	if (markerData && markerData.venue) {

		//console.log(markerData);

		var date = new Date(markerData.createdAt*1000);

		var infoTime = (date.toLocaleDateString() + " " + date.getHours() + ":" + date.getMinutes());
		var infoName = (markerData.user.firstName + " " + markerData.user.lastName);
		var infoUserImage = markerData.user.photo.prefix + "100x100" + markerData.user.photo.suffix;
		var infoUserURL = "//foursquare.com/user/" + markerData.user.id;
		var infoVenu = (markerData.venue.name);
		var infoVenuURL = markerData.venue.canonicalUrl;
		var infoCoordinates = (markerData.venue.location.lat + ", " + markerData.venue.location.lng);
		var infoAddressOne = (markerData.venue.location.address);
		var infoAddressTwo = (markerData.venue.location.city + ", " + markerData.venue.location.state );

		$("#information").html("");

		$("#information")

			.append($("<hr/>").css('clear', 'both'))

			.append(
				$("<div/>").attr('id', "who")
				
				.append(
					$("<img/>")
						.css('float', 'left')
						.css('margin-right', 8)
						.attr({'src': infoUserImage, width: 100, height: 100})
				)

				.append($("<label/>").text("Who"))
				.append(
					$("<a/>")
						.attr('href',infoUserURL)
						.attr('target', "_blank")					
						.text(infoName)
				)

				.append($("<label/>").text("When"))
				.append($("<span/>").text(infoTime))

			)
			.append($("<hr/>").css('clear', 'both'))

			.append($("<label/>").text("Where"))
			.append(
				$("<a/>")
					.attr('href',infoVenuURL)
					.attr('target', "_blank")
					.text(infoVenu)
			)			

			.append($("<label/>").text("Address"))
			.append($("<span/>").text(infoAddressOne))
			.append($("<span/>").text(infoAddressTwo))

			.append($("<label/>").text("Coordinates"))
			.append(
				$("<span/>").append(
					$("<a/>")
						.attr('href',"//maps.google.com" +
							"?q=" + marker.position.lat() + "," + marker.position.lng())
						.text(infoCoordinates)
				)
			)
			.append($("<br/>"));		

	} else {

		var infoCoordinates = (marker.position.lat() + ", " + marker.position.lng());

		$("#information").html("");
		$("#information")


			.append($("<hr/>").css('clear', 'both'))


			.append($("<img/>")
				.attr('src', "//maps.googleapis.com/maps/api/streetview" +
					"?size=256x120" +
					"&location=" + marker.position.lat() + "," + marker.position.lng() + 
					"&fov=120&sensor=false")
				.attr({width: 256, height: 120}))

			.append($("<label/>").attr('id','coordinates').text("Coordinates"))
			.append(
				$("<span/>").append(
					$("<a/>")
						.attr('href',"//maps.google.com" +
							"?q=" + marker.position.lat() + "," + marker.position.lng())
						.text(infoCoordinates)
				)
			)
			.append($("<br/>"));;	



	}

	// Lookup Data

	var url = "//maps.googleapis.com/maps/api/geocode/json" +
	"?latlng=" + marker.position.lat() + "," + marker.position.lng() +
	"&sensor=false"
	$.ajax({ url: url, dataType: "json", success: function(data) {
		var html = (data.results[0].formatted_address).replace(",","<br/>");
		$("<label/>")
			.attr('id','address')
			.text("Address")
			.insertBefore("#coordinates");
		$("<span/>")
			.html(html)
			.insertBefore("#coordinates");
	}})

}