var source = { lat: 0, lng: 0 },
  map, markers = [], geocoder, service, places = [], listeners = [], directionsDisplayerarray = [];
var infowindow;
//window.addEventListener('load',getLocation);

var autocomplete;

$(window).blur(function () {
  //do something

  //$(window).trigger('load');

});




//map init part start //

function initMap() {


  //on window load , load map and userlocation etc
  google.maps.event.addDomListener(window, 'load', function () {

    attachAutocomplete(); // attaches auto complete to the correct location modal input type text


    document.getElementById('submit').addEventListener('click', initialiseSubmit); // on click to modal submit initialise map again 

    removeListeners(); //just to be sure removing all event listeners from the map markers

    getLocation(); //gets user location using navigator object

  });


  removeListeners();
  document.getElementById('suggestion').innerHTML=''; // refreshing suggestion div 

  infowindow = new google.maps.InfoWindow();  //initialises popup service on markers 

  geocoder = new google.maps.Geocoder(); //initialises geocoder object

  map = new google.maps.Map(document.getElementById('map'), {
    center: source,
    scrollwheel: false,
    zoom: 11,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });


  //sets user position on map by a marker
  marker = new google.maps.Marker({
    map: map,
    position: source,
    title: 'Your Location  ',
    icon: 'marker.png',
    map_icon_label: '<span class="map-icon map-icon-point-of-interest">your location </span>'
  });
  markers.push(marker); // collects the marker in the markers array for future reference 

  performPlaceSearch(); //perform Hospoital Search nearby in 30Km radius of user location
} //end of initMap



//get user location function def
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, errorCallBack, { enableHighAccuracy: true });
  }
  else {
    alert('Your Device does not support geolocation ');
  }
}



//set lat lang values of the user in source object and initMap to show user location 
function showPosition(position) {

  source.lat = position.coords.latitude, source.lng = position.coords.longitude;

  initMap();

}



//handle error if  user location not obtained  
function errorCallBack(msg) {

  if (msg.code == 1) //user denied permission
  {
    alert('Please enable your GPS position it is required, or else result will be shown according to your ip location');

    $.get('http://ip-api.com/json').then(function (data) {

      source.lat = data.lat, source.lng = data.lon;
      initMap();
    });


  }

  if (msg.code == 2) // un expected error
  {
    //reslove it by another service for ip location 
    $.get('http://ip-api.com/json').then(function (data) {

      source.lat = data.lat, source.lng = data.lon;
      initMap();
    });
  }

  if (msg.code == 3) //time out 
  {
    alert('time out, please reload and accept your location request');
  }

}




//attaches auto complete to alterlocation input type text
function attachAutocomplete() {

  autocomplete = new google.maps.places.Autocomplete(document.getElementById('alterLocation'));

  autocomplete.bindTo('bounds', map); //binds autocomplete to map user view (approx)
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


        $('.close').eq(0).trigger('click'); //closes modal for manual location input 

      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });



  }

}

//removes all markers from the map 
function clearMap() {

  markers.forEach(function (marker) {

    marker.setMap(null);
  });

}


function performPlaceSearch() {

//request object that contains the search query 
  var request_doc = {
    location: source,
    radius: '30000',
    query: "children's hospital"
  }; 
  


  service = new google.maps.places.PlacesService(map);
  service.textSearch(request_doc, performPlaceSearchcallback); // performs search 
  

}

//gets called after the search is complete 
function performPlaceSearchcallback(result, status) {

  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < result.length; i++) {

      if (result[i].formatted_address.indexOf('India') > -1 ) {
         if(result[i].formatted_address.indexOf('United') < 0) 
       { 
        places.push(result[i]); //pushing the result in an array for future use 

        console.log(result[i]);
        createMarker(result[i],i);  // creates markers for the searched hospitals
 
       }
      }


    }
  }
  else {

    console.log('search was not successful for the following reason: ' + status);

  }

}

//creates marker 
function createMarker(result,i) {

  marker = new google.maps.Marker({
    map: map,
    title: result.name,
    position: result.geometry.location,
    icon: 'baby-icon.png',
    customInfo:''+i

  });

  attachListner(marker, result , i); //attaches listner to markers 
  markers.push(marker);

}

function attachListner(marker, result, i) {

  populateSuggestions(result);

  // mouse hover on marker opens popup window on them  
  var listener = google.maps.event.addListener(marker, 'mouseover', function () {
    infowindow.setContent('<div style=" width:200px; word-wrap : break-word;"><strong> ' + result.name + '</strong><br><br>' +
      '<br><br>' +
      result.formatted_address + '</div>');
    infowindow.open(map, this);




  });


  listeners.push(listener); // collecting mouseover listener

  //on mouse leave close pop up 
  listener = google.maps.event.addListener(marker, 'mouseout', function () {

    infowindow.close(map, this);
  });

  listeners.push(listener);

  //on click to marker shows direction from user location 
  listener = google.maps.event.addListener(marker, 'click', function () {

    document.getElementById('dvPanel').innerHTML = ''; //refreshing  text direction panel 

    removePrevDirection();

    directionShow(result);
     if(!isOpen && !isMobile.any())
     { openNav();  }
    //highlight active selected element on suggestion div
    var count=parseInt(this.customInfo);
    console.log(count);

      var suggest_class=$(".suggest");
      for(var j=0; j<suggest_class.length ; j++)
      {
        suggest_class[j].classList.remove('active_suggest');

      }

      $(".suggest").eq(count).toggleClass( "active_suggest" );
      $("#suggestion").animate({scrollTop: suggest_class[count].offsetTop-15 }, 700, 'swing');
     //end of highlighting code
  });

}


//fills data related to the results obtained from json in suggestions div box
function populateSuggestions(result) {


  var service1 = new google.maps.places.PlacesService(map);

  var place_detail_request = {
    placeId: result.place_id
  };

  service1.getDetails(place_detail_request, function (place, status) {

    if (status == google.maps.places.PlacesServiceStatus.OK) {


      document.getElementById('suggestion').innerHTML += '<div class="suggest" ><strong> ' + result.name + '</strong><br><br>' +
        '<strong>Rating:</strong> ' + result.rating + " stars" + '<br><span class="glyphicon glyphicon-earphone">: ' + place.formatted_phone_number + '</span><br><strong>Address: </strong>' +
        result.formatted_address + '</div><hr/>';


    }
  });



}

// $(document).ready(function () {
//           if (!$.browser.webkit) {
//               $('.wrapper').html('<p>Sorry! Non webkit users. :(</p>');
//           }
//       });



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

//show direction on map
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