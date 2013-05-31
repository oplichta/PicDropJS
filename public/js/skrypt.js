/*jshint node: true, browser: true, jquery: true */
/*global io: false */
$(document).ready(function () {
	 	'use strict';
		var socket = io.connect('http://localhost:3000');
		var userName = $('#userName').html();

	socket.emit('loadPhoto',userName);
	socket.emit('loadPhotoBoard',userName);

	

//ROOM-----------------------------------------
var room = userName;
// //var room = prompt('jaki pokój: '); 

	if(room !== null ){
		$('#pokoj').html(room);
		socket.on('connect', function() {
	   // Connected, let's sign-up for to receive messages for this room
	   socket.emit('room', room);   
		});
 	}
$('#dolacz').click(function(){
	var newRoom = prompt();
	socket.emit('newRoom',newRoom);
	});
// socket.on('connectedClients',function (clients){
// 	for (var i = 0; i < clients.length; i++) {
// 		alert('connected clients'+clients[i]);
// 	};
// });
// socket.on('messageToAll',function(wiad){
// $('#odp').html(wiad);
// });
//----------------------------------------------
	$('#reset').click(function(){
		socket.emit('resetHistory',userName);
	});

 	var ocenaHTML ="<div  style='margin: 0' class='btn-toolbar'><div class='btn-group'><button data-toggle='dropdown' class='btn btn-success dropdown-toggle'>Ocena <span class='caret'></span></button><ul class='dropdown-menu'><li><div id='ocenaa' class='btn-group' data-toggle='buttons-radio'><button  class='btn btn-danger'>1</button><button  class='btn btn-warning'>2</button><button  class='btn btn-info'>3</button><button  class='btn btn-success'>4</button><button  class='btn btn-primary'>5</button></div></li></ul><button id='jakaOcenaa' class='btn btn-success' >0</button></div></div>";

	$('#guzik').click(function(){
	var	photoName =  document.getElementById('szukaj').value;
		    var flickerAPI = "http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";
		      $.getJSON( flickerAPI, {	
		        tags: photoName,
		        tagmode: "any",
		        format: "json"
		        }).done(function( data ){		      	  
					  $.each( data.items, function( i, item ) {						  		
						  	socket.emit('newPhoto',userName,photoName,item.media.m);							  							  											
						          	if ( i === 4) {
							          	  return false;
							          	}   					         	
		        	 });
	         	});	
	});


	
	var ocena = null;
	$("#ocena > .btn").on("click", function(){
 	   ocena = +this.innerHTML;
 	   // alert(ocenaa);
  	   $("#jakaOcena").html(ocena);
	});

	var ocenaa = null;
	$("#ocenaa > .btn").on("click", function(){
 	  ocenaa = +this.innerHTML;
 		   //alert(ocena);
 	 $("#jakaOcenaa").html(ocenaa);
	});
	socket.on('showLoadedPhoto',function (photo){
	$.each( photo, function( i, photo ) {						  		
		$("#gallery li").removeClass("image");
		$("#gallery").append("<li id='"+photo._id+"'><div  class='img-rounded'>"+photo.photoName+"</div></li>");	          
		$("#"+photo._id).addClass("image").draggable();
		$("<img class='img-polaroid'/>").attr( "src", photo.src ).appendTo('.image');
		$("#"+photo._id).append("<div>"+ocenaHTML+"</div>");				  							  											
			          	if ( i === 4) {
				          	  return false;
				          	}   					         	
			        	 });	
	});

	socket.on('showPhoto',function (photo){
		  $("#gallery li").removeClass("image");
          $("#gallery").append("<li id='"+photo._id+"'><div  class='img-rounded'>"+photo.photoName+"</div></li>");	          
          $("#"+photo._id).addClass("image").draggable(
	   			//        	{
				// 		drag: function(){
				// 			var offset = $(this).offset();
				// 			var xPos = offset.left;
				// 			var yPos = offset.top;
				// 			$('#posX').text('x: ' + xPos);
	   			// 			$('#posY').text('y: ' + yPos);
				// 			socket.emit('movePhoto',   xPos,yPos);						
				// 		},
				// 		 stop: function(){
				//             var finalOffset = $(this).offset();
				//             var finalxPos = finalOffset.left;
				//             var finalyPos = finalOffset.top;
				//         }
				// }
			);
	         $("<img class='img-polaroid'/>").attr( "src", photo.src ).appendTo('.image');
	         $("#"+photo._id).append("<div>"+ocenaHTML+"</div>");								        								    
	    });

				$('#Board').droppable(
				{
		        //accept: '#gallery',
		        // activeClass: "ui-state-hover",
		        // hoverClass: "ui-state-active",
			        over : function(){
			           $(this).animate({'border-width' : '5px',
			                             'border-color' : '#0f0'
			                            }, 500);
			            //$('#gallery').draggable('option','containment',$(this));      
			        },
			        drop: function( event, ui ) {
				        $('#Board').html( "Dropped!");				        
				          var id = $(ui.draggable).attr('id');
				          //alert(id);
				         socket.emit('newOnBoard',id);
				    },
				    out : function(){
				    	 $('#Board').html( "out!");
				    	 $(this).animate({'border-width' : '1px',
			                             'border-color' : '#0f0'
			                            }, 500);
				    }
		    	 });

			socket.on('boardToAll',function (photo){				
				$("#Board").append("<li id='"+photo._id+"'>"+photo.photoName+"</li>");
			          $("#Board li:last-child").prev().removeClass("image");
			          $("#Board li:last-child").addClass("image").draggable();
			   //        	{
						// drag: function(){
						// 	var offset = $(this).offset();
						// 	var xPos = offset.left;
						// 	var yPos = offset.top;
						// 	$('#posX').text('x: ' + xPos);
	  		 // 				$('#posY').text('y: ' + yPos);
						// 	socket.emit('movePhoto',   xPos,yPos);						
						// }
						// });		          
			          $( "<img/>" ).attr( "src",photo.src ).appendTo('.image');		          	
			});

	socket.on('showLoadedBoardPhoto',function (photo){
		$.each( photo, function( i, photo ) {						  		
			$("#Board li").removeClass("image");
			$("#Board").append("<li id='"+photo._id+"'><div  class='img-rounded'>"+photo.photoName+"</div></li>");	          
			$("#"+photo._id).addClass("image").draggable();
			$("<img class='img-polaroid'/>").attr( "src", photo.src ).appendTo('.image');
			$("#"+photo._id).append("<div>"+ocenaHTML+"</div>");		  							  											
			          	if ( i === 4) {
				          	  return false;
				          	}   					         	
	   	 });	
	});

		socket.on('updatePhotoPosition', function (x,y) {
			$('.image').css( { 'position':'absolute', top:y, left:x} );
		});
		
		socket.on('disconnectUser', function (photoId) {
			$('#'+photoId).remove();
		});
});
