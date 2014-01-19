$.ajax({
	url: "/api/get_listings",
	type: "GET",
	data: {
		"lat" : "lat",
		"lng" : "lng"
	},
	success: function(results){
		console.log(results);
	}
});