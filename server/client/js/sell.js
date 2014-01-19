$(window).load(function(){
	$("#foursquare").click(function(){
		navigator.geolocation.getCurrentPosition(function(position) {
	        $.get('/api/get_coords?lat=' + position.coords.latitude + '&lon=' + position.coords.longitude, function(data) {
	          var ul = $('<ul>');

	          for (var i in data) {
	            var a = $('<a>');
	            a.attr('href','#').html(data[i].name + ' <br>' + data[i].addr);
	            ul.append($('<li>').append(a));
	          }

	          $('.venues').append(ul);
	          
	        });
	        $(".venue-chooser").fadeIn();
	      });
	});
      
});