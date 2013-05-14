/*jshint node: true */
/*jshint node: true */
var express = require('express');
var http  = require('http');
var path = require('path');
var fs    = require('fs');
var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.static(path.join(__dirname, 'public')));
});

var server = http.createServer(app).listen(app.get('port'), function () {
    console.log("Serwer nasłuchuje na porcie " + app.get('port'));
});

var photos ={};

var io  = require('socket.io');
io = io.listen(server); 


io.sockets.on('connection', function (socket) {

    //socket.emit("init", userPhotos);

    // socket.on('disconnect', function() {
    //   delete photos[socket.id];
    //   socket.broadcast.emit("disconnectUser", socket.id);
    //    });

      // socket.on('newPhoto', function (name){
      //    // console.log('server dostalem '+name);
      //    var search = name;
      //       socket.emit('search', search);            
      //       // console.log('wyslalem '+search);
      // });
  
      function uniqId() {                  
      return Math.round(new Date().getTime() + (Math.random() * 10000));
    }

      socket.on('src', function (id){        
        socket.broadcast.emit('searchToAll',photos[id]);
        console.log('wyslalem id '+ photos[id].id);
        console.log('wyslalem src '+ photos[id].src);
        // console.log('wyslalem search'+ photos.search);

      });
      socket.on('newPhoto', function (name,src) {
        var uid= socket.id+uniqId();
        var photo=[];
        photos[uid] = {
            "id" : uid,
            "x" : 0,
            "y" : 0,
            "name" : name,
            "src" : src                    
        };
            socket.emit('show', photos[uid]);
            // console.log("newPhoto name "+ photos[uid].name);
            //  console.log("newPhoto src"+ photos[uid].src);
            //console.log(JSON.stringify(photos));
        });

        socket.on('movePhoto', function (x,y) {
        console.log('server x '+ x);
        console.log('server y '+ y);       
        // if(typeof photos!='undefined'){
        // photos[socket.id].x = x;
        // photos[socket.id].y = y;
        socket.broadcast.emit('updatePhotoPosition', x,y);
        // }
        });

        
      // socket.on('movePhoto', function (photo) {
      //   console.log('server x '+ photo.x);
      //   console.log('server y '+ photo.y);
      //   if(typeof photos[socket.id]!='undefined'){
      //   photos[socket.id].x = photo.x;
      //   photos[socket.id].y = photo.y;
      //   socket.broadcast.emit('updatePhotoPosition', photos[socket.id]);
      //   }
    // });
  });
