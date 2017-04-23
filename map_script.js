
var source={ lat: 0, lng: 0 },
map, markers=[] , geocoder , service,places ;

//window.addEventListener('load',getLocation);

var autocomplete;

$(window).blur(function() {
    //do something

     $(window).trigger('load');

});


function initMap()
{

	google.maps.event.addDomListener(window, 'load', function(){

		attachAutocomplete();

		document.getElementById('submit').addEventListener('click',initialiseSubmit);

		

	} );
	
	getLocation();

	geocoder = new google.maps.Geocoder();

	map = new google.maps.Map(document.getElementById('map'), {
		center: source,
		scrollwheel: false,
		zoom: 12,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});



	marker = new google.maps.Marker({
		map: map,
		position: source,
		icon: 'marker.png',
		map_icon_label: '<span class="map-icon map-icon-point-of-interest">your location </span>'
	});
	markers.push(marker);

    	performPlaceSearch();
}


function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.watchPosition(showPosition , errorCallBack , { enableHighAccuracy: true} );
	} 
	else {
		alert('Your Device does not support geolocation ');
	}
}

function showPosition(position) {

	source.lat = position.coords.latitude, source.lng = position.coords.longitude;

	initMap();

}

function errorCallBack(msg){ 
	alert('Please enable your GPS position future.');

}


function attachAutocomplete() {

	autocomplete = new google.maps.places.Autocomplete(document.getElementById('alterLocation'));
	autocomplete.bindTo('bounds', map);
}

        function initialiseSubmit()  //recorrects user location 
        {

        	var address = document.getElementById('alterLocation').value;

        	if(address)
        	{

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

        function clearMap()
        {

        	 markers.forEach(function (marker){

        	marker.setMap(null);
        });

        }


        function performPlaceSearch()
        {

        		var request = {
    								location: source,
   									 radius: '10000',
   									 query: "children's hospital"
 									};


 			service = new google.maps.places.PlacesService(map);
  			service.textSearch(request, performPlaceSearchcallback);
							


        }

        function performPlaceSearchcallback(result,status)
        {

        		if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < result.length; i++) {
      var place = result[i];
     
      createMarker(result[i]);
    }
  }
   else
   {

          console.log('search was not successful for the following reason: ' + status);
        
   }

        }


        function createMarker(result)
        {

        		 marker = new google.maps.Marker({
				map: map,
				position: result.geometry.location ,
				icon: 'baby-icon.png',
			
			});

		markers.push(marker);

        }