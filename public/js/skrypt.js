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
							  	socket.on('show',function (photo){
							          $("#gallery").append("<li id='"+photo.id+"' class='img-rounded'>"+photo.name+"</li>");
							          $("#gallery li").prev().removeClass("image");
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
								        	
								         
								          $( "<img/>" ).attr( "src", photo.src ).appendTo('.image');
								    });											
								          	if ( i === 0 ) {
								          	  return false;
								          	}				          
					         	
			        	 });
		         	});	
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
