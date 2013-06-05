/*jshint node: true, browser: true, jquery: true */
/*global io: false */
$(document).ready(function () {
	 	'use strict';
		var socket = io.connect('http://localhost:3000');
		var userName = $('#userName').html();
		var room = 'Globalny';
var	navbarHTML ="<form class='navbar-search pull-left' ><input id='szukaj' class='search-query span2' type='text' placeholder='Szukaj'><button id='guzik' class='btn btn-inverse'>Ok</button></form><ul class='nav pull-right'><li><a id='resetGallery'href='#'>Wyczyść galerie</a></li><li class='divider-vertical'></li><li class='dropdown'><a class='dropdown-toggle' data-toggle='dropdown' href='#'>Opcje<b class='caret'></b></a><ul class='dropdown-menu'><li><a id='reset' href='#'>Usuń historie</a></li><li><a id='dolacz' href='#'>Dołącz do innego pokoju</a></li><li><a id='recoverSession' href='#'>Przywróć ostatnią sesję</a></li></ul>";	
//ROOM-----------------------------------------
	socket.emit('whatRoom',userName);						
	socket.on('readRoom', function (pokoj){
			 $('#pokoj').html(pokoj.room);
			 if(pokoj === 'Globalny' ){
			 	if(userName!== undefined || userName !== null || userName === pokoj.userName){
				socket.emit('saveRoom',userName,'Globalny');
				}
			}
		});

if( $('#pokoj').html() !== undefined){$('.container').append(navbarHTML);}

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
//----------------------------------------------

$('#reset').click(function(){
		socket.emit('resetHistory',userName);
	});
$('#resetGallery').click(function(){
		$('#gallery').html(" ");
	});
$('.ocena button').on("click",function(){
		var costam=	$(this).attr('id');
		alert(costam);
		});
$('.zoom').click(function(){
	// var id = $('.zoom').closest('li').attr('id');
	var value = $("#"+id+"").attr( "src" ); 
	value = value.replace("_m", "_b");
	$("#fotka").attr( "src", value );
});
// $('#gallery li').bind('mouseover', function() {
//   var id = $(this).attr('id');
//   $('#cosID').html(id);
// });
// $('#gallery li').mouseover(function() {
//     var i = $(this).attr('id');
//    	$('#cosID').html(i);
// });

// $(document).on('click','.ocena > .btn',function(){
// 	 var ocenaaa=$(this).parent().attr('id');
// 	 alert(ocenaaa);
// });

	
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
						          	if ( i === 5) {
							          	  return false;
							          	}   					         	
		        	 });
	         	});	
	});

// var goryhtml='<li id="51af800f2b06afac09000037" class="ui-draggable" style="position: relative; left: 17px; top: -3px;"><div class="img-rounded">mountains</div><img class="img-polaroid" src="http://farm6.staticflickr.com/5344/8960385807_974ea2f978_m.jpg"><div><div class="btn-toolbar" style="margin: 0"><div class="btn-group"><button class="btn btn-success dropdown-toggle" data-toggle="dropdown">Ocena<span class="caret"></span></button><ul class="dropdown-menu"><li><div class="ocena btn-group" data-toggle="buttons-radio"><button id="1_51af800f2b06afac09000037" class="btn btn-danger">1</button><button id="2_51af800f2b06afac09000037" class="btn btn-warning">2</button><button id="3_51af800f2b06afac09000037" class="btn btn-info">3</button><button id="4_51af800f2b06afac09000037" class="btn btn-success">4</button><button id="5_51af800f2b06afac09000037" class="btn btn-primary active">5</button></div></li></ul><button class="jakaOcenaa btn btn-success">0</button><button class="zoom btn btn-success" data-toggle="modal"><i class="icon-zoom-in"></i></button></div></div></div></li>'
// $('#gallery').append(goryhtml);
// $('#51af800f2b06afac09000037').draggable({ revert: "invalid" });

	

	var ocenaHTML ="<div  style='margin: 0' class='btn-toolbar'><div class='btn-group'><button data-toggle='dropdown' class='btn btn-success dropdown-toggle'>Ocena <span class='caret'></span></button><ul class='dropdown-menu'><li><div class='ocena btn-group' data-toggle='buttons-radio'><button id='1_";
 	var ocenaHTM1 ="' class='btn btn-danger'>1</button><button id='2_";
 	var ocenaHTM2 ="' class='btn btn-warning'>2</button><button id='3_";
 	var ocenaHTM3 ="' class='btn btn-info'>3</button><button id='4_";
 	var ocenaHTM4 ="' class='btn btn-success'>4</button><button id='5_";
 	var ocenaHTM5 ="' class='btn btn-primary'>5</button>";
 	var ocenaHTMLreszta ="</div></li></ul><button class='jakaOcenaa btn btn-success' >0</button><button   class='zoom btn btn-success' data-toggle='modal'><i class='icon-zoom-in'></i></button></div></div>";
	
	socket.on('showLoadedPhoto',function (photo,count){
	$.each( photo, function( i, photo ) {						  		
		$("#gallery li").removeClass("image");
		$("#gallery").append("<li id='"+photo._id+"'><div  class='img-rounded'>"+photo.photoName+"</div></li>");	          
		$("#"+photo._id).addClass("image").draggable({ revert: "invalid" });
		$("<img class='img-polaroid'/>").attr( "src", photo.src ).appendTo('.image');
		$("#"+photo._id).append("<div>"+ocenaHTML+photo._id+ocenaHTM1+photo._id+ocenaHTM2+photo._id+ocenaHTM3+photo._id+ocenaHTM4+photo._id+ocenaHTM5+ocenaHTMLreszta+"</div>");				  							  											
		$("#gallery li").last().removeClass("image");
			          	if ( i === count) {
				          	  return false;
				          	}   					         	
			        	 });	
	});

	socket.on('showPhoto',function (photo){
		if(photo !==null){
		  $("#gallery li").removeClass("image");
          $("#gallery").append("<li id='"+photo._id+"'><div  class='img-rounded'>"+photo.photoName+"</div></li>");	          
          $("#"+photo._id).addClass("image").draggable({ revert: "invalid" });
	      $("<img class='img-polaroid'/>").attr( "src", photo.src ).appendTo('.image');
	      $("#"+photo._id).append("<div>"+ocenaHTML+photo._id+ocenaHTM1+photo._id+ocenaHTM2+photo._id+ocenaHTM3+photo._id+ocenaHTM4+photo._id+ocenaHTM5+ocenaHTMLreszta+"</div>");								        								    
	 	  $("#gallery li").last().removeClass("image");
	   }
	    });

	$('#Board').droppable(
		{
	     over : function(){
		 $(this).animate({'border-width' : '6px',
		                  'border-color' : '#0f0'
		                     }, 500);    
		 },
		drop: function( event, ui ) {		        
		       var id = $(ui.draggable).attr('id');
		       var tmpRoom =$('#pokoj').html();
		      socket.emit('newOnBoard',id,tmpRoom);
		 },
		 out : function(){
		 	 $(this).animate({'border-width' : '3px',
		                         'border-color' : '#0f0'
		                        }, 500);
		 }
	 });

	socket.on('boardToAll',function (photo){
		if(photo !==null){
			$("#Board li").removeClass("image");
			$("#Board").append("<li id='"+photo._id+"'><div  class='img-rounded'>"+photo.photoName+"</div></li>");	          
			$("#"+photo._id).addClass("image");
			$("<img class='img-polaroid'/>").attr( "src", photo.src ).appendTo('.image');
			$("#"+photo._id).append("<div>"+ocenaHTML+photo._id+ocenaHTM1+photo._id+ocenaHTM2+photo._id+ocenaHTM3+photo._id+ocenaHTM4+photo._id+ocenaHTM5+ocenaHTMLreszta+"</div>");
			$("#Board li").last().removeClass("image");
		}	          	
	});

	socket.on('showLoadedBoardPhoto',function (photo,count){
		$.each( photo, function( i, photo ) {						  		
			$("#Board li").removeClass("image");
			$("#Board").append("<li id='"+photo._id+"'><div  class='img-rounded'>"+photo.photoName+"</div></li>");	          
			$("#"+photo._id).addClass("image").draggable({ revert: "invalid" });
			$("<img class='img-polaroid'/>").attr( "src", photo.src ).appendTo('.image');
			$("#"+photo._id).append("<div>"+ocenaHTML+photo._id+ocenaHTM1+photo._id+ocenaHTM2+photo._id+ocenaHTM3+photo._id+ocenaHTM4+photo._id+ocenaHTM5+ocenaHTMLreszta+"</div>");		  							  											
			$("#Board li").last().removeClass("image"); 
			          	if ( i === count) {
				          	  return false;
				          	}   					         	
	   	 });	
	});
	
});
