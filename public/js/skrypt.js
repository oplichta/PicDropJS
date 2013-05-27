/*jshint node: true, browser: true, jquery: true */
/*global io: false */
$(document).ready(function () {
	 	'use strict';
		var socket = io.connect('http://localhost:3000');
		var userPhoto = {
			id : 'id',
			name : 'nazwa',
			src : 'src'
		};

//ROOM-----------------------------------------
//var room = "abc123";
var room = prompt('jaki pokój: ');
$('#pokoj').html(room);
// let's assume that the client page, once rendered, knows what room it wants to join

socket.emit('newRoom',room);

socket.on('connect', function() {
   // Connected, let's sign-up for to receive messages for this room
   socket.emit('room', room);   
});
 


$('#wyslij').click(function(){
	var wiad = $('#inputTxt').val();
	alert(wiad);
	socket.emit('message', wiad);
	});
socket.on('messageToAll',function(wiad){
$('#odp').html(wiad);
});
//----------------------------------------------


 	var ocenaHTML ="<div  style='margin: 0' class='btn-toolbar'><div class='btn-group'><button data-toggle='dropdown' class='btn btn-success dropdown-toggle'>Ocena <span class='caret'></span></button><ul class='dropdown-menu'><li><div id='ocenaa' class='btn-group' data-toggle='buttons-radio'><button  class='btn btn-danger'>1</button><button  class='btn btn-warning'>2</button><button  class='btn btn-info'>3</button><button  class='btn btn-success'>4</button><button  class='btn btn-primary'>5</button></div></li></ul><button id='jakaOcenaa' class='btn btn-success' >0</button></div></div>";


		$('#guzik').click(function(){
			userPhoto.name =  document.getElementById('szukaj').value;
			    var flickerAPI = "http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";
			      $.getJSON( flickerAPI, {	
			        tags: userPhoto.name,
			        tagmode: "any",
			        format: "json"
				      }).done(function( data ){		      	  
						  $.each( data.items, function( i, item ) {						  		
							  	userPhoto.src = item.media.m;
							  	socket.emit('newPhoto',userPhoto.name,userPhoto.src);							  							  											
								          	if ( i === 0 ) {
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
	
		
	

	socket.on('show',function (photo){
									  $("#gallery li").removeClass("image");
							          $("#gallery").append("<li id='"+photo.id+"'><div  class='img-rounded'>"+photo.name+"</div></li>");
							 
							          
							          $("#"+photo.id).addClass("image").draggable(
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
								         $("#"+photo.id).append("<div>"+ocenaHTML+"</div>");
								        								    
								    });
			
			//	var nowa = $("#ocenaa option:selected").text();  
            //alert(nowa); 
		
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
				         socket.emit('src',id);
				         // $('#Board').html();
				         // $('#Board').html(" "+zrodlo);
				    },
				    out : function(){
				    	 $('#Board').html( "out!");
				    	 $(this).animate({'border-width' : '1px',
			                             'border-color' : '#0f0'
			                            }, 500);
				    }

		    	 });

		
			socket.on('searchToAll',function (photo){				
				$("#Board").append("<li id='"+photo.id+"'>"+photo.name+"</li>");
			          $("#Board li:last-child").prev().removeClass("image");
			          $("#Board li:last-child").addClass("image").draggable(
			          	{
						drag: function(){
							var offset = $(this).offset();
							var xPos = offset.left;
							var yPos = offset.top;
							$('#posX').text('x: ' + xPos);
	  		     			$('#posY').text('y: ' + yPos);
							socket.emit('movePhoto',   xPos,yPos);						
						}
						});		          
			          $( "<img/>" ).attr( "src",photo.src ).appendTo('.image');		          	
			});

		// socket.on('createPhoto', function (photo) {
		// 	console.log(name);
		// 	$('#gallery').append('<div class="photo" id='+photo.id+'>'+photo.name+'</div>');
		// 	$('#'+photo.id).draggable().css({'background-color' : 'blue'});
		// });
		// socket.on('init', function (photos) {
		// 	$.each(photos, function(key, val) {
		// 		$('#gallery').append('<div class="photo" id='+val.id+'>'+val.name+'</div>');
		// 		$('#'+val.id).css({'position':'absolute', top:val.y , left:val.x , 'background-color' : 'grey'});
		// 	});
		// });
		socket.on('updatePhotoPosition', function (x,y) {
			$('.image').css( { 'position':'absolute', top:y, left:x} );
		});
		
		socket.on('disconnectUser', function (photoId) {
			$('#'+photoId).remove();
		});
});
