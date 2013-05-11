/*jshint node: true, browser: true, jquery: true */
/*global io: false */
$(document).ready(function () {
	 'use strict';
		var socket = io.connect('http://localhost:3000');
		var userPhotos=[];
		var uid ='';
	  	function uniqId() {     	           
		  return Math.round(new Date().getTime() + (Math.random() * 10000));
		}	

		$('#guzik').click(function(){
				socket.emit('getId');
				socket.on('sendId',function (id){				
						uid = id+uniqId();						
				});
				userPhotos[uid] = {
						    id : uid,
						    name : 'name',
						    src  : 'src'
						};
				userPhotos[uid].name =  document.getElementById('szukaj').value;
				
		
				// addUserPhoto(name,uid);				
				// socket.emit('addPhoto', name);
				// socket.emit('newPhoto', name);			
				// socket.on('search',
					
			      var flickerAPI = "http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";
			      $.getJSON( flickerAPI, {
			        tags: userPhotos[uid].name,
			        tagmode: "any",
			        format: "json"
				      }).done(function( data ){		      	  
						  $.each( data.items, function( i, item ) {
				          $("#gallery").append("<li id='"+userPhotos[uid].id+"' class='img-rounded'>"+userPhotos[uid].name+"</li>");
				          $("#gallery li:last-child").prev().removeClass("image");
				          $("#gallery li:last-child").addClass("image").draggable(
					          	{
										drag: function(){
											var offset = $(this).offset();
											var xPos = offset.left;
											var yPos = offset.top;
											$('#posX').text('x: ' + xPos);
					           				$('#posY').text('y: ' + yPos);
											socket.emit('movePhoto',   xPos,yPos);						
										},
										 stop: function(){
								            var finalOffset = $(this).offset();
								            var finalxPos = finalOffset.left;
								            var finalyPos = finalOffset.top;
								        }
								}
							);
					        	//addUserPhoto(,,item.media.m);
					        	//$('.uid').append("<div>+userPhotos[uid].src+</div>");
					          //socket.emit('newPhoto',name,src);
					          alert( item.media.m);
					          $( "<img/>" ).attr( "src", item.media.m ).appendTo('.image');
					          	if ( i === 0 ) {
					          	  return false;
					          	}
					          	
			        	 });
		         	});

				
			
		});
		// socket.on('showBoardToAll',function (src,search){
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
				        // socket.emit('src',fotka,zrodlo);
				        //socket.get();
				         socket.emit('src',photo.src,photo.name);
				        // $('#Board').html(fotka);
				        // $('#Board').html("search "+zrodlo);
				    },
				    out : function(){
				    	 $('#Board').html( "out!");
				    	 $(this).animate({'border-width' : '1px',
			                             'border-color' : '#0f0'
			                            }, 500);
				    }

		    	 });



		// });
		socket.on('searchToAll',function (src,search){
			$("#Board").append("<li>"+search+"</li>");
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
		          $( "<img/>" ).attr( "src", src ).appendTo('.image');		          	
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
