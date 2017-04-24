
var source = { lat: 0, lng: 0 },
  map, markers = [], geocoder, service, places = [], listeners = [], directionsDisplayerarray = [];
var infowindow;
//window.addEventListener('load',getLocation);

var autocomplete;

$(window).blur(function () {
  //do something

  //$(window).trigger('load');

});


function initMap() {


  google.maps.event.addDomListener(window, 'load', function () {

    attachAutocomplete();

    document.getElementById('submit').addEventListener('click', initialiseSubmit);

    removeListeners(); //just to be sure removing all event listeners 

    getLocation();

  });


  removeListeners();

  infowindow = new google.maps.InfoWindow();

  geocoder = new google.maps.Geocoder();

  map = new google.maps.Map(document.getElementById('map'), {
    center: source,
    scrollwheel: false,
    zoom: 11,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });



  marker = new google.maps.Marker({
    map: map,
    position: source,
    title: 'Your Location  ',
    icon: 'marker.png',
    map_icon_label: '<span class="map-icon map-icon-point-of-interest">your location </span>'
  });
  markers.push(marker);

  performPlaceSearch();
}


function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(showPosition, errorCallBack, { enableHighAccuracy: true });
  }
  else {
    alert('Your Device does not support geolocation ');
  }
}

function showPosition(position) {

  source.lat = position.coords.latitude, source.lng = position.coords.longitude;

  initMap();

}

function errorCallBack(msg) {
  alert('Please enable your GPS position it is required.');

}


function attachAutocomplete() {

  autocomplete = new google.maps.places.Autocomplete(document.getElementById('alterLocation'));

  autocomplete.bindTo('bounds', map);
}

function initialiseSubmit()  //recorrects user location 
{

  var address = document.getElementById('alterLocation').value;

  if (address) {

    geocoder.geocode({ 'address': address }, function (results, status) {
      if (status === 'OK') {

        source = results[0].geometry.location;

        /*clears all the markers from the map*/
        clearMap();
        initMap(); //initialise map again


        $('.close').eq(0).trigger('click');

      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });



  }

}

function clearMap() {

  markers.forEach(function (marker) {

    marker.setMap(null);
  });

}


function performPlaceSearch() {

  var request = {
    location: source,
    radius: '30000',
    query: "children's hospital"
  };


  service = new google.maps.places.PlacesService(map);
  service.textSearch(request, performPlaceSearchcallback);



}

function performPlaceSearchcallback(result, status) {

  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < result.length; i++) {

      if (result[i].formatted_address.indexOf('India') > -1) {

        places.push(result[i]); //using the result in an array

        console.log(result[i]);
        createMarker(result[i]);

      }


    }
  }
  else {

    console.log('search was not successful for the following reason: ' + status);

  }

}


function createMarker(result) {

  marker = new google.maps.Marker({
    map: map,
    title: result.name,
    position: result.geometry.location,
    icon: 'baby-icon.png',

  });

  attachListner(marker, result)
  markers.push(marker);

}

function attachListner(marker, result) {




  populateSuggestions(result);


  var listener = google.maps.event.addListener(marker, 'mouseover', function () {
    infowindow.setContent('<div style=" width:200px; word-wrap : break-word; "><strong> ' + result.name + '</strong><br><br>' +
      'Rating: ' + result.rating + " stars" + '<br><br>' +
      result.formatted_address + '</div>');
    infowindow.open(map, this);




  });


  listeners.push(listener); // collecting all listeners

  listener = google.maps.event.addListener(marker, 'mouseout', function () {

    infowindow.close(map, this);
  });

  listeners.push(listener);


  listener = google.maps.event.addListener(marker, 'click', function () {

    document.getElementById('dvPanel').innerHTML = '';

    removePrevDirection();

    directionShow(result);

  });

}



function populateSuggestions(result) {


  var service1 = new google.maps.places.PlacesService(map);

  var place_detail_request = {
    placeId: result.place_id
  };

  service1.getDetails(place_detail_request, function (place, status) {

    if (status == google.maps.places.PlacesServiceStatus.OK) {


      document.getElementById('suggestion').innerHTML += '<div style="margin-bottom:2%; display:inline-block; width:100%; word-wrap : break-word; "><strong> ' + result.name + '</strong><br><br>' +
        '<strong>Rating:</strong> ' + result.rating + " stars" + '<br><span class="glyphicon glyphicon-earphone">: ' + place.formatted_phone_number + '</span><br><strong>Address: </strong>' +
        result.formatted_address + '</div><br>';


    }
  });



}



function removeListeners() {


  for (var j = 0; j < listeners.length; j++) {

    google.maps.event.removeListener(listeners[j]);

    console.log(listeners[j]);
  }
}

function removePrevDirection() {

  for (var j = 0; j < directionsDisplayerarray.length; j++) {
    directionsDisplayerarray[j].setMap(null);

  }


}


function directionShow(result) {


  var destination1 = result.geometry.location;

  var directionsDisplay = new google.maps.DirectionsRenderer({
    map: map,
    draggable: true
  });

  directionsDisplay.setPanel(document.getElementById('dvPanel'));

  //directionsDisplayer.push(directionsDisplay);
  // Set destination, origin and travel mode.
  var request = {
    destination: destination1,
    origin: source,
    travelMode: 'DRIVING'
  };


  // Pass the directions request to the directions service.
  var directionsService = new google.maps.DirectionsService();

  directionsService.route(request, function (response, status) {


    if (status == 'OK') {
      // Display the route on the map.

      directionsDisplay.setDirections(response);

      directionsDisplayerarray.push(directionsDisplay); //keeping list of all directions set

      var dist_service = new google.maps.DistanceMatrixService();

      dist_service.getDistanceMatrix({
        origins: [source],
        destinations: [destination1],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      }, function (response, status) {
        if (status == google.maps.DistanceMatrixStatus.OK && response.rows[0].elements[0].status != "ZERO_RESULTS") {
          var distance = response.rows[0].elements[0].distance.text;
          var duration = response.rows[0].elements[0].duration.text;

          // var dist_div = document.getElementById('distance');

          // dist_div.innerHTML="Distance :"+distance +"<br>Duration:"+duration;

        } else {
          alert("Unable to find the distance via road.");
        }
      });




    }
  });

}