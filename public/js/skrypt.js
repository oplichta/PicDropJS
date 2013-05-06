/*jshint node: true, browser: true, jquery: true */
/*global io: false */
$(document).ready(function () {
	 'use strict';
		var socket = io.connect('http://localhost:3000');
		
			
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
		          $("#gallery").append("<li>"+search+"</li>");
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
					}
					});
		          socket.emit('src',item.media.m,search);
		          $( "<img/>" ).attr( "src", item.media.m ).appendTo('.image');
		          	if ( i === 0 ) {
		          	  return false;
		          	}
	        	});
         	});
			});
		});
		socket.on('searchToAll',function (src,search){
			$("#gallery").append("<li>"+search+"</li>");
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
