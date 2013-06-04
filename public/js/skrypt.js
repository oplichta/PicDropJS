/*jshint node: true, browser: true, jquery: true */
/*global io: false */
$(document).ready(function () {
	 	'use strict';
		var socket = io.connect('http://localhost:3000');
		var userName = $('#userName').html();
		var room = 'Globalny';

	socket.emit('whatRoom',userName);						
	socket.on('readRoom', function (pokoj){
			 $('#pokoj').html(pokoj.room);
			 if(pokoj === 'Globalny' ){
			 	if(userName!== undefined || userName !== null || userName === pokoj.userName){
				socket.emit('saveRoom',userName,'Globalny');
				}
			}
		});
		
//var	navbarHTML ="<div class='navbar-inner'><div class='container'><a class='btn btn-navbar' data-target='.navbar-inverse-collapse' data-toggle='collapse'><span class='icon-bar'></span><span class='icon-bar'></span><span class='icon-bar'></span></a><a class='brand' href='#'>Title</a><div class='nav-collapse collapse navbar-inverse-collapse'><ul class='nav'><li class='active'><a href='#'>Home</a></li><li><a href='#'>Link</a></li><li><a href='#'>Link</a></li><li class='dropdown'><a class='dropdown-toggle' data-toggle='dropdown' href='#'><ul class='dropdown-menu'></li></ul><form class='navbar-search pull-left' action=''><input class='search-query span2' type='text' placeholder='Search'></form><ul class='nav pull-right'><li><a href='#'>Link</a></li><li class='divider-vertical'></li><li class='dropdown'><a class='dropdown-toggle' data-toggle='dropdown' href='#'>Dropdown<b class='caret'></b></a><ul class='dropdown-menu'><li><a href='#'>Action</a></li><li><a href='#'>Another action</a></li><li><a href='#'>Something else here</a></li><li class='divider'></li><li><a href='#'>Separated link</a></li></ul></li></ul></div></div></div></div>"
	
//ROOM-----------------------------------------

$('#dolacz').click(function(){
	var newRoom = prompt('Wpisz nazwę pokoju: ');
	if(newRoom !== null || newRoom !== undefined){
		socket.emit('newRoom',newRoom,userName);
		$('#pokoj').html(newRoom);
	}
});

$('#recoverSession').click(function(){							
			var tmpRoom = $('#pokoj').html();
			socket.emit('loadPhoto',userName,tmpRoom);
			socket.emit('loadPhotoBoard',tmpRoom);		
});

$('#reset').click(function(){
		socket.emit('resetHistory',userName);
	});
//pozniej wczytaj zdjecia i zdjecia pokoju z tablicy
		
	//$('body').append(navbarHTML);
	//	socket.on('connect', function() {
	// Connected, let's sign-up for to receive messages for this room
	//   socket.emit('room', room);   
	//	});
 	
//----------------------------------------------
	

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
