$(window).load(function(){
	var hash = $("#chatHash").html();
	$.ajax({
		url: "/api/get_chats",
		type: "GET",
		data: {
			"hash" : hash
		},
		success: function(results){
			console.log("done");
			console.log(results);
		}
	});

	$("#chatForm").submit(function(e){
		var hash = $("#chatHash").html();
		e.preventDefault();
		var chatMsg = $("#chatInput").val();
		if (chatMsg === ""){
			alert("Message Empty");
		}
		else{
			$.ajax({
				url: "/api/send_message",
				type: "POST",
				data: {
					"hash" : hash,
					"msg" : chatMsg
				},
				success: function(results){
					console.log(results);
				}
			});
		}
	});
});