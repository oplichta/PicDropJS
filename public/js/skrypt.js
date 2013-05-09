/*jshint node: true, browser: true, jquery: true */
/*global io: false */
$(document).ready(function () {
	 'use strict';
		var socket = io.connect('http://localhost:3000');
		var fotka ="";
		var zrodlo ="";
			
			$('#guzik').click(function(){
			var name =  document.getElementById('szukaj').value;
			// socket.emit('addPhoto', name);

			socket.emit('newPhoto', name);			
			socket.on('search',function (search){
		      var flickerAPI = "http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";
		      $.getJSON( flickerAPI, {
		        tags: search,
		        tagmode: "any",
		        format: "json"
		      }).done(function( data ){
				  $.each( data.items, function( i, item ) {
		          $("#gallery").append("<li class='img-rounded'>"+search+"</li>");
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
					 	});
		          fotka = item.media.m;
		          zrodlo = search;
		         // socket.emit('src',item.media.m,search);
		          $( "<img/>" ).attr( "src", item.media.m ).appendTo('.image');
		          	if ( i === 0 ) {
		          	  return false;
		          	}
	        	});
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
				        socket.emit('src',fotka,zrodlo);
				        $('#Board').html(fotka);
				        $('#Board').html("search "+zrodlo);
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
