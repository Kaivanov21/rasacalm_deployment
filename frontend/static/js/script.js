// ========================== greet user proactively ========================
$(document).ready(function () {

	//drop down menu for close, restart conversation & clear the chats.
	$('.dropdown-trigger').dropdown();

	//initiate the modal for displaying the charts, if you dont have charts, then you comment the below line
	$('.modal').modal();

	//enable this if u have configured the bot to start the conversation. 
	// showBotTyping();
	// $("#userInput").prop('disabled', true);

	//global variables
	action_name = "action_greet_user";
	user_id = "user";

	//if you want the bot to start the conversation
	// action_trigger();

})

// ========================== restart conversation ========================
function restartConversation() {
	$("#userInput").prop('disabled', true);
	//destroy the existing chart
	$('.collapsible').remove();

	if (typeof chatChart !== 'undefined') { chatChart.destroy(); }

	$(".chart-container").remove();
	if (typeof modalChart !== 'undefined') { modalChart.destroy(); }
	$(".chats").html("");
	$(".usrInput").val("");
	send("/restart");
}

// ========================== let the bot start the conversation ========================
function action_trigger() {

	// send an event to the bot, so that bot can start the conversation by greeting the user
	$.ajax({
		url: `http://127.0.0.1/rasa/conversations/${user_id}/execute`,
		type: "POST",
		contentType: "application/json",
		data: JSON.stringify({ "name": action_name, "policy": "MappingPolicy", "confidence": "0.98" }),
		success: function (botResponse, status) {
			console.log("Response from Rasa: ", botResponse, "\nStatus: ", status);

			if (botResponse.hasOwnProperty("messages")) {
				setBotResponse(botResponse.messages);
			}
			$("#userInput").prop('disabled', false);
		},
		error: function (xhr, textStatus, errorThrown) {

			// if there is no response from rasa server
			setBotResponse("");
			console.log("Error from bot end: ", textStatus);
			$("#userInput").prop('disabled', false);
		}
	});
}

//=====================================	user enter or sends the message =====================
$(".usrInput").on("keyup keypress", function (e) {
	var keyCode = e.keyCode || e.which;

	var text = $(".usrInput").val();
	if (keyCode === 13) {

		if (text == "" || $.trim(text) == "") {
			e.preventDefault();
			return false;
		} else {
			//destroy the existing chart, if you are not using charts, then comment the below lines
			$('.collapsible').remove();
			if (typeof chatChart !== 'undefined') { chatChart.destroy(); }

			$(".chart-container").remove();
			if (typeof modalChart !== 'undefined') { modalChart.destroy(); }



			$("#paginated_cards").remove();
			$(".suggestions").remove();
			$(".quickReplies").remove();
			$(".usrInput").blur();
			setUserResponse(text);
			send(text);
			e.preventDefault();
			return false;
		}
	}
});

$("#sendButton").on("click", function (e) {
	var text = $(".usrInput").val();
	if (text == "" || $.trim(text) == "") {
		e.preventDefault();
		return false;
	}
	else {
		//destroy the existing chart

		// chatChart.destroy();
		// $(".chart-container").remove();
		// if (typeof modalChart !== 'undefined') { modalChart.destroy(); }

		$(".suggestions").remove();
		$("#paginated_cards").remove();
		$(".quickReplies").remove();
		$(".usrInput").blur();
		setUserResponse(text);
		send(text);
		e.preventDefault();
		return false;
	}
})

//==================================== Set user response =====================================
function setUserResponse(message) {
	var UserResponse = '<img class="userAvatar" src=' + "/img/userAvatar.jpg" + '><p class="userMsg">' + message + ' </p><div class="clearfix"></div>';
	$(UserResponse).appendTo(".chats").show("slow");

	$(".usrInput").val("");
	scrollToBottomOfResults();
	showBotTyping();
	$(".suggestions").remove();
}

//=========== Scroll to the bottom of the chats after new message has been added to chat ======
function scrollToBottomOfResults() {

	var terminalResultsDiv = document.getElementById("chats");
	terminalResultsDiv.scrollTop = terminalResultsDiv.scrollHeight;
}

//============== send the user message to rasa server =============================================
function send(message) {
	var url = document.location.protocol + "//" + document.location.hostname;
	$.ajax({

		url: url + "/rasa/webhooks/rest/webhook",
		type: "POST",
		contentType: "application/json",
		data: JSON.stringify({ message: message, sender: user_id }),
		success: function (botResponse, status) {
			console.log("Response from Rasa: ", botResponse, "\nStatus: ", status);

			// if user wants to restart the chat and clear the existing chat contents
			if (message.toLowerCase() == '/restart') {
				$("#userInput").prop('disabled', false);

				//if you want the bot to start the conversation after restart
				// action_trigger();
				return;
			}
			setBotResponse(botResponse);

		},
		error: function (xhr, textStatus, errorThrown) {

			if (message.toLowerCase() == '/restart') {
				// $("#userInput").prop('disabled', false);

				//if you want the bot to start the conversation after the restart action.
				// action_trigger();
				// return;
			}

			// if there is no response from rasa server
			setBotResponse("");
			console.log("Error from bot end: ", textStatus);
		}
	});
}

//=================== set bot response in the chats ===========================================
function setBotResponse(response) {

	//display bot response after 500 milliseconds
	setTimeout(function () {
		hideBotTyping();
		if (response.length < 1) {
			//if there is no response from Rasa, send  fallback message to the user
			var fallbackMsg = "I am facing some issues, please try again later!!!";

			var BotResponse = '<img class="botAvatar" src="/img/botAvatar.png"/><p class="botMsg">' + fallbackMsg + '</p><div class="clearfix"></div>';

			$(BotResponse).appendTo(".chats").hide().fadeIn(1000);
			scrollToBottomOfResults();
		}
		else {

			//if we get response from Rasa
			for (i = 0; i < response.length; i++) {

				//check if the response contains "text"
				if (response[i].hasOwnProperty("text")) {
					var BotResponse = '<img class="botAvatar" src="/img/botAvatar.png"/><p class="botMsg">' + response[i].text + '</p><div class="clearfix"></div>';
					$(BotResponse).appendTo(".chats").hide().fadeIn(1000);
				}

				//check if the response contains "images"
				if (response[i].hasOwnProperty("image")) {
					var BotResponse = '<div class="singleCard">' + '<img class="imgcard" src="' + response[i].image + '">' + '</div><div class="clearfix">';
					$(BotResponse).appendTo(".chats").hide().fadeIn(1000);
				}


				//check if the response contains "buttons" 
				if (response[i].hasOwnProperty("buttons")) {
					addSuggestion(response[i].buttons);
				}

				//check if the response contains "custom" message  
				if (response[i].hasOwnProperty("custom")) {

					//check if the custom payload type is "quickReplies"
					if (response[i].custom.payload == "quickReplies") {
						quickRepliesData = response[i].custom.data;
						showQuickReplies(quickRepliesData);
						return;
					}

					//check if the custom payload type is "dropDown"
					if (response[i].custom.payload == "dropDown") {
						dropDownData = response[i].custom.data;
						renderDropDwon(dropDownData);
						return;
					}

					//check if the custom payload type is "location"
					if (response[i].custom.payload == "location") {
						$("#userInput").prop('disabled', true);
						getLocation();
						scrollToBottomOfResults();
						return;
					}

					//check if the custom payload type is "cardsCarousel"
					if (response[i].custom.payload == "cardsCarousel") {
						restaurantsData = (response[i].custom.data)
						showCardsCarousel(restaurantsData);
						return;
					}

					//check if the custom payload type is "chart"
					if (response[i].custom.payload == "chart") {

						// sample format of the charts data:
						// var chartData = { "title": "Leaves", "labels": ["Sick Leave", "Casual Leave", "Earned Leave", "Flexi Leave"], "backgroundColor": ["#36a2eb", "#ffcd56", "#ff6384", "#009688", "#c45850"], "chartsData": [5, 10, 22, 3], "chartType": "pie", "displayLegend": "true" }

						//store the below parameters as global variable, 
						// so that it can be used while displaying the charts in modal.
						chartData = (response[i].custom.data)
						title = chartData.title;
						labels = chartData.labels;
						backgroundColor = chartData.backgroundColor;
						chartsData = chartData.chartsData;
						chartType = chartData.chartType;
						displayLegend = chartData.displayLegend;

						// pass the above variable to createChart function
						createChart(title, labels, backgroundColor, chartsData, chartType, displayLegend)
						return;
					}

					//check of the custom payload type is "collapsible"
					if (response[i].custom.payload == "collapsible") {
						data = (response[i].custom.data);
						//pass the data variable to createCollapsible function
						createCollapsible(data);
					}
				}
			}
			scrollToBottomOfResults();
		}
	}, 500);
}

//====================================== Toggle chatbot =======================================
$("#profile_div").click(function () {
	$(".profile_div").toggle();
	$(".widget").toggle();
});

//====================================== DropDown ==================================================
//render the dropdown message sand handle user selection
function renderDropDwon(data) {
	var options = "";
	for (i = 0; i < data.length; i++) {
		options += '<option value="' + data[i].value + '">' + data[i].label + '</option>'
	}
	var select = '<div class="dropDownMsg"><select class="browser-default dropDownSelect"> <option value="" disabled selected>Choose your option</option>' + options + '</select></div>'
	$(".chats").append(select);

	//add event handler if user selects a option.
	$("select").change(function () {
		var value = ""
		var label = ""
		$("select option:selected").each(function () {
			label += $(this).text();
			value += $(this).val();
		});

		setUserResponse(label);
		send(value);
		$(".dropDownMsg").remove();
	});
}

//====================================== Suggestions ===========================================

function addSuggestion(textToAdd) {
	setTimeout(function () {
		var suggestions = textToAdd;
		var suggLength = textToAdd.length;
		$(' <div class="singleCard"> <div class="suggestions"><div class="menu"></div></div></diV>').appendTo(".chats").hide().fadeIn(1000);
		// Loop through suggestions
		for (i = 0; i < suggLength; i++) {
			$('<div class="menuChips" data-payload=\'' + (suggestions[i].payload) + '\'>' + suggestions[i].title + "</div>").appendTo(".menu");
		}
		scrollToBottomOfResults();
	}, 1000);
}

// on click of suggestions, get the value and send to rasa
$(document).on("click", ".menu .menuChips", function () {
	var text = this.innerText;
	var payload = this.getAttribute('data-payload');
	console.log("payload: ", this.getAttribute('data-payload'))
	setUserResponse(text);
	send(payload);

	//delete the suggestions once user click on it
	$(".suggestions").remove();

});

//====================================== functions for drop-down menu of the bot  =========================================

// Bot pop-up intro
document.addEventListener("DOMContentLoaded", () => {
	const elemsTap = document.querySelector(".tap-target");
	// eslint-disable-next-line no-undef
	const instancesTap = M.TapTarget.init(elemsTap, {});
	instancesTap.open();
	setTimeout(() => {
	  instancesTap.close();
	}, 4000);
  });

  window.addEventListener('load', () => {
	// initialization
	$(document).ready(() => {
	  // Bot pop-up intro
	  $("div").removeClass("tap-target-origin");
  
	  // drop down menu for close, restart conversation & clear the chats.
	  $(".dropdown-trigger").dropdown();
	});
});
// 	// Toggle the chatbot screen
// 	$("#profile_div").click(() => {
// 	  $(".profile_div").toggle();
// 	  $(".widget").toggle();
// 	});
  
// 	// clear function to clear the chat contents of the widget.
// 	$("#clear").click(() => {
// 	  $(".chats").fadeOut("normal", () => {
// 		$(".chats").html("");
// 		$(".chats").fadeIn();
// 	  });
// 	});
  

//restart function to restart the conversation.
$("#restart").click(function () {
	restartConversation()
});

//clear function to clear the chat contents of the widget.
$("#clear").click(function () {
	$(".chats").fadeOut("normal", function () {
		$(".chats").html("");
		$(".chats").fadeIn();
	});
});

//close function to close the widget.
$("#close").click(function () {
	$(".profile_div").toggle();
	$(".widget").toggle();
	scrollToBottomOfResults();
});


//======================================bot typing animation ======================================
function showBotTyping() {

	var botTyping = '<img class="botAvatar" id="botAvatar" src="/img/botAvatar.png"/><div class="botTyping">' + '<div class="bounce1"></div>' + '<div class="bounce2"></div>' + '<div class="bounce3"></div>' + '</div>'
	$(botTyping).appendTo(".chats");
	$('.botTyping').show();
	scrollToBottomOfResults();
}

function hideBotTyping() {
	$('#botAvatar').remove();
	$('.botTyping').remove();
}
