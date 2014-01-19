$(window).load(function(){
	$("#foursquare").click(function(){
		navigator.geolocation.getCurrentPosition(function(position) {
	        $.get('/api/get_coords?lat=' + position.coords.latitude + '&lon=' + position.coords.longitude, function(data) {
	        	console.log(data);
	          var ul = $('<ul>');

	          for (var i in data) {
	            var a = $('<a>');
	            a.attr('href','#').html(data[i].name);
	            a.data("lat", data[i].lat);
	            a.data("lng", data[i].lng);
	            ul.append($('<li>').append(a));
	          }
	          $('.venues').append(ul);
	          
	        });
	        $(".venue-chooser").fadeIn();
	      });
	});

	$('#eatwith').click(function() {
		if ($(this).find('input').prop('checked')) {
			$(this).find('input').prop('checked', false);
			$(this).removeClass('checked');
		} else {
			$(this).find('input').prop('checked', true);
			$(this).addClass('checked');
		}
	});

	$(document).click(function (e){
	    if (!$(".venues").is(e.target) && $(".venues").has(e.target).length === 0){
	        $(".venue-chooser").fadeOut();
	    }
	});

	$(".venues").on("click", "a", function(){
		$("#foursquare").html($(this).html());
		$("#foursquare").data("lat", $(this).data("lat"));
		$("#foursquare").data("lng", $(this).data("lng"));
		$(".venue-chooser").fadeOut();
	});

	$("#listingForm").submit(function(e){
		e.preventDefault();
		var rate = $("#listingRate").val();
		var msg = $("#listingMsg").val();
		if (rate === ""){
			alert("Rate required");
		}
		else if (msg === ""){
			alert("Msg required");
		}
		else if ($(".blockDinexSelect.selected")[0] === undefined){
			alert("Select block or dinex");
		}
		else{
			var listingType = $(".blockDinexSelect.selected").html();
			var location = $("#foursquare").html();
			var lat = $("#foursquare").data("lat");
			var lng = $("#foursquare").data("lng");
			console.log(location);
			if ($("#eatwith").find("input").prop("checked")){
				var status = "1";
			}
			else{
				var status = "0";
			}
			$.ajax({
				url: "/api/add_listing",
				type: "POST",
				data: {
					"location" : location,
					"lat" : lat,
					"lng" : lng,
					"rate" : rate,
					"listingType" : listingType,
					"status" : status,
					"msg" : msg
				},
				success: function(results){
					if (results === undefined || results.hash === undefined || results.hash === ""){
						alert("Error adding listing");
					}
					else{
    					Backbone.history.navigate('/chat/' + results.hash, {trigger: true});
					}
				},
				error: function(err){
					alert("Error adding listing");
				}
			});
		}

	});

	$(".blockDinexSelect").click(function(){
		$(".blockDinexSelect").removeClass("selected");
		if ($(this).html() === "Block"){
			$("#listingRate").attr("placeholder", "Price");
		}
		else if($(this).html() === "DineX"){
			$("#listingRate").attr("placeholder", "Percentage");
		}
		$(this).addClass("selected");
	});
      
});
