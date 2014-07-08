/*****************************************************************
	KROKI Web Application Flat UI - JavaScript implementation

	Author: Milorad Filipovic [mfili@uns.ac.rs]
	Copyrigth (c) 2014 KROKI Team, 
					   Chair of Informatics
					   Faculty of Technical Sciences
					   Novi Sad, Serbia

	https://github.com/KROKIteam
 *****************************************************************/
$(document).ready(function(e) {

	//number of miliseconds that popup messages are being visible for
	var delay = 2000;
	//speed of fade out and fade in effects
	var fadeSpeed = 300;
	//form (div.forms) that is currently being dragged
	var dragged = null;
	//offsets for dragging forms
	var ox = 0;
	var oy = 0;
	//remember username so it can be switched with logout text
	var username = $("#logoutLink").text();
	//if the username is shorter than the word "Logout", keep the minimal width of the link
	if(username.length < 6) {
		$("#logoutLink").outerWidth(88);
	}

	//delete dummy text generated by KROKI menu generator for empty divs
	$(".arrow-down").empty();
	$(".arrow-right").empty();

	//cache container div for later use
	var container = $("#container");
	
	//if the confirm dialog is shown, remember which form to refresh after hiding the overlay
	var formToRefresh;
	
	/**************************************************************************************************************************
													   															   MENU EFFECTS
	 **************************************************************************************************************************/
	//PAGE LOAD ANIMATION
	//Slide down the navigation
	$("nav").slideDown("slow", function() {
		$("#mainMenu").fadeIn("fast", function() {
			$("#logoutDiv").fadeIn("slow");
		});
	});

	//MAKE MAIN MENU ITEMS INVERT COLORS ON MOUSE HOVER
	$(".menu").hover(function(e) {
		if($(this).parent().find("ul.L1SubMenu").css('visibility') === 'hidden') {
			$(this).parent().addClass("hover");
		}
	}, function(e) {
		if($(this).parent().find("ul.L1SubMenu").css('visibility') === 'hidden') {
			$(this).parent().removeClass("hover");	
		}
	});

	//OPEN SUBMENU ON CLICK
	// $(".menu") is a <div> within main menu list elements which contains text and down arrow
	// so getting parent of $(".menu") we get the actual <li> element
	$(".menu").click(function(e) {
		//if corresponding submenu is not allready open, open it while closing all other submenus
		if($(this).parent().find("ul.L1SubMenu").css('visibility') === 'hidden') {
			$(".menu").each(function(index, element) {
				$(this).parent().removeClass("hover");
				$(this).parent().find("ul.L1SubMenu").css({"visibility":"hidden"});
				$(this).parent().find("ul.L2SubMenu").hide();
			});
			$(this).parent().addClass("hover");
			$(this).parent().find("ul.L1SubMenu").css({"visibility":"visible"});
		}else {
			//if a submenu is open, just close it on click
			$(this).parent().addClass("hover");
			$(this).parent().find("ul.L1SubMenu").css({"visibility":"hidden"});
		}
	});

	//INVERT SUBMENU ITEMS COLORS ON MOUSE HOVER
	$("li.subMenuItem").hover(function(e) {
		e.stopPropagation();
		$(this).addClass("hover-li");
		$(this).find("span").addClass("arrow-right-hover");
	}, function(e) {
		e.stopPropagation();
		$(this).removeClass("hover-li");
		$(this).find("span").removeClass("arrow-right-hover");
	});

	//SHOW HIGHER LEVEL SUBMENUS ON CLICK
	$(".subMenuLink").click(function(e) {
		e.stopPropagation();
		// if submenu is not visible, click opens it
		if(!$(this).find("ul.L2SubMenu").is(":visible")) {
			// first close all others
			$(this).parent().find("ul.L2SubMenu").each(function(index, element) {
				$(this).hide();
			});
			$(this).children("ul.L2SubMenu").first().show();
		}else {
			//if submenu is allready opened, it is closed on click
			$(this).children("ul.L2SubMenu").first().hide();
		}

	});

	//SHOW "LOGOUT" TEXT WHEN HOVERING OVER USERNAME
	$("#logoutLink").hover(function() {
		//keep original width if username is longer than "Logout" so link doesn't shrink
		if(username.length > 6) {
			$(this).outerWidth($(this).outerWidth())
		}
		$(this).text("Logout");
	}, function(){
		$(this).text(username);
	});

	/**************************************************************************************************************************
													   															   FORM EFFECTS
	 **************************************************************************************************************************/

	//CREATE FORM <DIV> ON MENU ITEM CLICK
	$("li.subMenuItem").click(function(e) {
		if(!$(this).hasClass("subMenuLink")) {
			// Hide all the submenus
			$(".L1SubMenu").each(function(index, element) {
				$(this).css({"visibility":"hidden"});;
			});
			// Return the main menu color to inital values
			$("li.mainMenuItems").each(function(index, element) {
				$(this).removeClass("hover");
			});
			var activateLink = $(this).attr("data-activate");
			var panelType = $(this).attr("data-paneltype");
			
			makeNewWindow(activateLink, $(this).text(), panelType);
			
		}
	});

	//CLOSE FORM ON 'X' BUTTON CLICK
	container.on("click", ".headerButtons", function(e) {
		e.stopPropagation();
		$(this).parent().parent().remove();
		delete $(this).parent().parent();
	});

	//FOCUS FORM ON CLICK
	container.on("click", ".windows", function() {
		focus($(this));
	});

	//DRAG FORMS WHEN DRAGGING HEADERS

	// mousedown on .formheaders - make current form draggable
	container.on("mousedown", ".windowHeaders", function(e) {
		dragged = $(this).parent();
		focus(dragged);
		//coordinates of a mouse
		var ex = e.pageX;
		var ey = e.pageY;
		//coordinates of the form
		var position = dragged.position();
		var fx = position.left;
		var fy = position.top;
		//offsets of these coordinates
		ox = ex - fx;
		oy = ey - fy;
		//offsets are calculated here to avoid calculation on mouse move
		//since the offsets stay the same during the dragging process
	});

	// mouseup  - stop dragging forms
	$("html").mouseup(function() {
		dragged = null;
	});

	$("html").mousemove(function(e) {
		if(dragged != null) {
			var ex = e.pageX;
			var ey = e.pageY;
			dragged.offset({
				left: ex - ox,
				top: ey - oy
			});
		}
	});

	//FUNCTION THAT CREATES HTML WINDOWS
	function makeNewWindow(activateLink, label, panelType) {
		//make div.window
		var newWindow = $(document.createElement("div"));
		newWindow.addClass("windows");
		//make div.windowHeaders and it's contents
		var newWindowHeader = $(document.createElement("div"));
		newWindowHeader.addClass("windowHeaders");
		var newWindowName = $(document.createElement("div"));
		newWindowName.addClass("windowName");
		newWindowName.text(label);
		var newHeaderButtonDiv = $(document.createElement("div"));
		newHeaderButtonDiv.addClass("headerButtons");
		newHeaderButtonDiv.attr("title", "Close window");
		var newHeaderButtonImage = $(document.createElement("img"));
		newHeaderButtonImage.attr("src", "/files/images/icons-white/close.png");
		
		newHeaderButtonDiv.append(newHeaderButtonImage);
		newWindowHeader.append(newWindowName);
		newWindowHeader.append(newHeaderButtonDiv);
		
		var activateSplit = activateLink.split("/");
		
		//make div.windowBody
		newWindowBody = $(document.createElement("div"));
		newWindowBody.addClass("windowBody");
		
		newWindow.append(newWindowHeader)
		newWindow.append(newWindowBody);
		
		container.append(newWindow);
		//if the form that needs to ne displayed is parent-child form
		//get containing forms names by parsing the 'data-paneltype' attribute
		//and get data for each form by envoking ajax call to server
		if(panelType.indexOf("parent-child") != -1) {
			//remove the 'parent-child', strip the square brackets and split attribute by ':'
			var formsSplit = panelType.substring(13, panelType.length-1).split(":");
			
			for(var i=0; i<formsSplit.length; i++) {
				var newStandardForm = $(document.createElement("div"));
				newStandardForm.addClass("standardForms");
				newStandardForm.attr("data-activate", "/resources/" + formsSplit[i]);
				newStandardForm.attr("data-resourceId", formsSplit[i]);
				newStandardForm.css({"height": (90/formsSplit.length) + "%"});
				
				newWindowBody.append(newStandardForm);
				loadDataToForm(newStandardForm, true);
			}
			
		}else {
			var newStandardForm = $(document.createElement("div"));
			newStandardForm.addClass("standardForms");
			newStandardForm.attr("data-activate", activateLink);
			if(activateSplit.length > 3) {
				newStandardForm.attr("data-resourceId", activateSplit[activateSplit.length-3]);
			}else {
				newStandardForm.attr("data-resourceId", activateSplit[activateSplit.length-1]);
			}
			newWindowBody.append(newStandardForm);
			loadDataToForm(newStandardForm, false);
		}
		
		/*
		 * If number of columns is more than 6, add 200 pixels for each
		 * and 200 px in height for each standard form 
		 */
		var columns = newWindow.find("th").length;
		var forms = newWindow.find(".standardForms").length;
		if(columns > 6) {
			var newWidth = columns*200;
			if(newWidth<$("#container").width()) {
				newWindow.width(newWidth);
			}else {
				newWindow.width("98%");
				newWindow.css({
					"top": 60,
					"left": 20,
				});
			}
		}
		if(forms > 2) {
			var newHeight = forms*200;
			if(newHeight < $("#container").height()) {
				newWindow.height(newHeight);
			}else {
				newWindow.height("85%");
				newWindow.css({
					"top": 60,
					"left": 20,
				});
			}
		}
	}
	
	/**************************************************************************************************************************
													   															 TABLE EFFECTS
	 **************************************************************************************************************************/

	// SELECT TABLE ROWS ON MOUSE CLICK
	// Only one row can be selected at a time
	container.on("click", ".mainTable tbody tr", function() {
		var form = $(this).closest(".standardForms");
		var window = $(this).closest(".windows");
		$(this).parent().find("tr").removeClass("selectedTr");
		$(this).addClass("selectedTr");
		form.find("#btnPrev").removeAttr("disabled");
		form.find("#btnNext").removeAttr("disabled");
		form.find("#btnDelete").removeAttr("disabled");
		form.find("#btnNextForms").removeAttr("disabled");
		
		//if the table is on parent-child panel, filter data on table below and select first row
		if(window.find(".standardForms").length > 1) {
			var parentId = form.attr("data-resourceId");
			var childForm = form.next();
			var childId = childForm.attr("data-resourceId");
			var rowId = $(this).find("#idCell").text();
			//call server method only if child form exists below this form
			if(childForm.length > 0) {
				$.ajax({
				url: "/showChildren/" + childId + "/" + parentId + "/" + rowId,
				type: 'GET',
				encoding:"UTF-8",
				contentType: "text/html; charset=UTF-8",
				success: function(data) {
					childForm.html(data);
					var firstRow = childForm.find(".mainTable tbody tr:first-child");
					if(firstRow.length > 0) {
						firstRow.trigger("click");
					}else {
						childForm.next().find(".tablePanel").empty();
					}
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) { 
					$("#messagePopup").html("<p>" + errorThrown + "</p>");
					$("#messagePopup").attr("class", "messageError");
					$("#messagePopup").prepend("<div></div>");
					$("#messagePopup").slideToggle(300).delay(delay).slideToggle(500);
				}
			});
			}
		}
		
	});

	//"SWITCH VIEW" BUTTON:
	// - Shows forms for adding new and editing existent rows in table
	container.on("click", "#btnSwitch", function(e) {
		var tableDiv = $(this).closest("div.tableDiv");
		var selectedRow = tableDiv.find(".mainTable tbody tr.selectedTr");
		var formBody = $(this).closest(".windowBody");
		var form = $(this).closest("div.standardForms");

		//if a row is selected, edit form needs to be displayed,
		//otherwise, an empty form for adding is shown
		if(selectedRow.length > 0) {
			var id = selectedRow.find("#idCell").text();
			var resName = form.attr("data-resourceId");
			//since edit form is fetched from server on each click, remove previous one
			formBody.remove(".inputForm[name=editForm]");
			$.ajax({
				url: "/edit/" + resName + "/" + id,
				type: 'GET',
				encoding:"UTF-8",
				contentType: "text/html; charset=UTF-8",
				success: function(data) {
					form.append(data);
					form.find(".nextPopup").hide();
					form.fadeOut(fadeSpeed, function(e) {
						form.find(".tableDiv").hide();
						form.find(".operationsDiv").hide();
						form.find(".inputForm[name=editForm]").show();
						form.fadeIn(fadeSpeed);
					});
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) { 
					$("#messagePopup").html("<p>" + errorThrown + "</p>");
					$("#messagePopup").attr("class", "messageError");
					$("#messagePopup").prepend("<div></div>");
					$("#messagePopup").slideToggle(300).delay(delay).slideToggle(500);
				}
			});
		}else {
			form.find(".nextPopup").hide();
			form.fadeOut(fadeSpeed, function(e) {
				form.find(".tableDiv").hide();
				form.find(".operationsDiv").hide();
				form.find(".inputForm[name=addForm]").show();
				form.fadeIn(fadeSpeed);
			});
		}
	});

	// FIRST, LAST, PREVIOUS AND NEXT BUTTONS IMPLEMENTATIONS

	container.on("click", "#btnFirst", function(e) {
		var form = $(this).closest("div.standardForms");
		var tableDiv = $(this).closest("div.tableDiv");
		var firstTR = tableDiv.find(".mainTable tbody tr:first-child");
		if(firstTR.length > 0) {
			/*tableDiv.find(".mainTable tbody tr").removeClass("selectedTr");
			//select first element
			firstTR.addClass("selectedTr");*/
			firstTR.trigger("click");
			//scroll to top
			tableDiv.find(".tablePanel").scrollTop(0);
			form.find("#btnPrev").removeAttr("disabled");
			form.find("#btnNext").removeAttr("disabled");
			form.find("#btnDelete").removeAttr("disabled");
			form.find("#btnNextForms").removeAttr("disabled");
		}
	});

	container.on("click", "#btnPrev", function(e) {
		var tableDiv = $(this).closest("div.tableDiv");
		var tablePanel = tableDiv.find(".tablePanel");
		var selectedRow = tableDiv.find(".mainTable tbody tr.selectedTr");

		if(selectedRow.length > 0) {
			if(selectedRow.prev().length > 0) {
				var position = selectedRow.prev().position();
				selectedRow.prev().trigger("click");
				//detect whent the selected row gets out of the view port, and scroll so it gets on top
				if(position.top < tablePanel.position().top) {
					tablePanel.scrollTop((selectedRow.next().index()-2) * selectedRow.next().outerHeight());
				}
			}
		}
	});

	container.on("click", "#btnNext", function(e) {
		var tableDiv = $(this).closest("div.tableDiv");
		var tablePanel = tableDiv.find(".tablePanel");
		var selectedRow = tableDiv.find(".mainTable tbody tr.selectedTr");
		if(selectedRow.length > 0) {
			if(selectedRow.next().length > 0) {
				var position = selectedRow.next().position();
				selectedRow.next().trigger("click");
				//detect whent the selected row gets out of the view port, and scroll so it gets on top
				if((position.top + selectedRow.next().outerHeight()) > (tablePanel.position().top + tablePanel.outerHeight()) ) {
					tablePanel.scrollTop((selectedRow.next().index()+2) * selectedRow.next().outerHeight());
				}
			}
		}
	});

	container.on("click", "#btnLast", function(e) {
		var form = $(this).closest("div.standardForms");
		var tableDiv = $(this).closest("div.tableDiv");
		var lastTR = tableDiv.find(".mainTable tbody tr:last-child");
		if(lastTR.length > 0) {
			//select last element
			lastTR.trigger("click");
			//scroll to bottom
			var position = lastTR.position();
			tableDiv.find(".tablePanel").scrollTop(position.top);
			form.find("#btnPrev").removeAttr("disabled");
			form.find("#btnNext").removeAttr("disabled");
			form.find("#btnDelete").removeAttr("disabled");
			form.find("#btnNextForms").removeAttr("disabled");
		}
	});

	/* SHOW NEXT POPUP BUTTON CLICK */
	container.on("click", "#btnNextForms", function(e) {
		var form = $(this).closest("div.standardForms");
		var popup = form.find(".nextPopup");
		var tableDiv = $(this).closest("div.tableDiv");
		var selectedRow = tableDiv.find(".mainTable tbody tr.selectedTr");
		popup.css({
			'position': 'absolute',
			'left': $(this).position().left,
			'top': $(this).position().top + $(this).height() + 10 
		});
		popup.fadeToggle();
	});

	container.on("click", ".nextList li", function(e) {
		var form = $(this).closest("div.standardForms");
		var tableDiv = form.find("div.tableDiv");
		var selectedRow = tableDiv.find(".mainTable tbody tr.selectedTr");
		
		if(selectedRow.length > 0) {
			var id = selectedRow.find("#idCell").text();
			var cresName = $(this).attr("data-childid");
			var presName = form.attr("data-resourceId");
			
			makeNewWindow("/showChildren/" + cresName + "/" + presName  + "/" + id, cresName + " from " + presName ,"next-panel");
			$(this).closest(".nextPopup").hide();
		}
	});
	
	container.on("click", "#btnRefresh", function(e) {
		var form = $(this).closest("div.standardForms");
		refreshFormData(form);
	});

	container.on("click", "#btnAdd", function(e) {
		var tableDiv = $(this).closest("div.tableDiv");
		var selectedRow = tableDiv.find(".mainTable tbody tr.selectedTr");
		var formBody = $(this).closest(".windowBody");
		var form = $(this).closest("div.standardForms");

		form.find(".nextPopup").hide();
		form.fadeOut("slow", function(e) {
			form.find(".tableDiv").hide();
			form.find(".operationsDiv").hide();
			form.find(".inputForm[name=addForm]").show();
			form.fadeIn("slow");
		});
	});

	container.on("click", "#btnDelete", function(e) {
		var form = $(this).closest("div.standardForms");
		var tableDiv = form.find("div.tableDiv");
		var selectedRow = tableDiv.find(".mainTable tbody tr.selectedTr");
		
		if(selectedRow.length > 0) {
			var id = selectedRow.find("#idCell").text();
			var presName = form.attr("data-resourceId");
			formToRefresh = form;
			showConfirmDialog("Confirm delete", "/delete/" + presName + "/" + id, "Are you sure you wish to delete the selected row?");
		}
	});
	
	//OK i Cancel buttons on confirm dialogs
	$("#cancelConfirm").click(function(e) {
		$("#overlay").hide();
	});
	
	$("#cconfirmBtn").click(function(e) {
		$("#overlay").hide();
		var link = $(this).closest("#confirmDialog").attr("data-confirmLink");
		if(link != "justClose") {
			$.ajax({
				url: link,
				type: 'GET',
				encoding:"UTF-8",
				contentType: "text/html; charset=UTF-8",
				success: function(data) {
					$("#messagePopup").html(data);
					var clas = $("#messagePopup").find("p").attr("data-cssClass");
					$("#messagePopup").attr("class", clas);
					$("#messagePopup").prepend("<div></div>");
					$("#messagePopup").slideToggle(300).delay(delay).slideToggle(500);
					refreshFormData(formToRefresh);
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) { 
					$("#messagePopup").html("<p>" + errorThrown + "</p>");
					$("#messagePopup").attr("class", "messageError");
					$("#messagePopup").prepend("<div></div>");
					$("#messagePopup").slideToggle(300).delay(delay).slideToggle(500);
				}
			});
		}
	});
	
	function showConfirmDialog(name, confirmLink, text) {
		$("#confirmDialog .windowName").text(name);
		$("#confirmDialog").attr("data-confirmLink", confirmLink);
		$("#confirmDialog p").text(text);
		$("#overlay").show();
	}

	//OPERATION BUTTON CLICKS
	container.on("click", ".operationButton button[data-operation]", function(e) {
		var name = $(this).text();
		var link = $(this).attr("data-confirmLink");
		var text = $(this).attr("data-confirmText");
		showConfirmDialog(name, link, text);
		
	});
	
	/**************************************************************************************************************************
													   														INPUT PANEL EFFECTS
	 **************************************************************************************************************************/
	container.on("click", "#button-cancel", function(e) {
		e.preventDefault();
		var form = $(this).closest("div.standardForms");
		form.fadeOut("slow", function(e) {
			refreshFormData(form);
			form.find(".tableDiv").show();
			form.find(".operationsDiv").show();
			form.find(".inputForm").hide();
			form.fadeIn(fadeSpeed);
		});
		form.trigger("reset");
	});

	container.on("click", "#button-ok", function(e) {
		e.preventDefault();
		var form = $(this).closest(".inputForm");
		var act = form.attr('action');
		var method = form.attr('method');
		$.ajax({
			type: method,
			url: act,
			data: form.serialize(),
			encoding:"UTF-8",
			contentType: "text/html; charset=UTF-8",
			success: function (data) {
				$("#messagePopup").html(data);
				var clas = $("#messagePopup").find("p").attr("data-cssClass");
				$("#messagePopup").attr("class", clas);
				$("#messagePopup").prepend("<div></div>");
				$("#messagePopup").slideToggle(300).delay(delay).slideToggle(500);
				if(clas == "messageOk") {
					if(form.attr("name") == "addForm") {
						form.trigger("reset");
					}
				}
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) { 
				$("#messagePopup").html("<p>" + errorThrown + "</p>");
				$("#messagePopup").attr("class", "messageError");
				$("#messagePopup").prepend("<div></div>");
				$("#messagePopup").slideToggle(300).delay(delay).slideToggle(500);
			}
		});
	});
});
//---------------------------------------------------------------------//           UTIL FUNCTIONS

/*
 * Fetches the data from server to form element
 * */
function loadDataToForm(form, displayTitle) {
	var activateLink = form.attr("data-activate");
	var window = form.closest(".windows");
	$.ajax({
		url: activateLink,
		type: 'GET',
		encoding:"UTF-8",
		contentType: "text/html; charset=UTF-8",
		success: function(data) {
			form.html(data);
			window.show();
			focus(window);
			if(!displayTitle) {
				form.find("h1").remove();
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			window.remove();
			delete window;
			$("#messagePopup").html("<p><b>ERROR:</b> " + errorThrown + "</p>");
			$("#messagePopup").attr("class", "messageError");
			$("#messagePopup").prepend("<div></div>");
			$("#messagePopup").slideToggle(300).delay(2000).slideToggle(500);
		}
	});
}

//Form is focused by applying 'focused' css class
//which adds drop-shadow effect to it and puts the form in front of the others.
//Only one form can be focused at a time.
function focus(form) {
	$(".windows").each(function(index, element) {
		$(this).removeClass("focused");
		$(this).addClass("unfocused");
	});
	form.removeClass("unfocused");
	form.addClass("focused");
}

/*
 * Refresh form data from database
 */
function refreshFormData(form) {
	var win = form.closest("div.windows");
	form.fadeOut("fast", function() {
		var showTitle = false;
		if((win.find(".standardForms").length) > 1) {
			showTitle =  true;
		}
		loadDataToForm(form, showTitle);
		$(this).fadeIn("fast", function(e) {
			if(form.next().length > 0) {
				refreshFormData(form.next());
			}
		});
	});
}