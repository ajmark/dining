$(window).load(function(){
	var hash = $("#chatHash").html();
	$.ajax({
		url: "/api/get_chats",
		type: "GET",
		data: {
			"hash" : hash
		},
		success: function(chatObjArr){
			console.log(chatObjArr);
			for (var i = 0; i < chatObjArr.length; i++){
				if (chatObjArr[i].sender === "self"){
					$("#chatArea").append("<div class='me'><div>" + chatObjArr[i].msg + "</div></div>");
				}
				else{
					$("#chatArea").append("<div class='you'><div>" + chatObjArr[i].msg + "</div></div>");
				}
			}
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