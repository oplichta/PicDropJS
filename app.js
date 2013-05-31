/*jshint node: true */
var path = require('path'),   
    express = require('express'),
    http = require('http'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    Schema = mongoose.Schema,
    LocalStrategy = require('passport-local').Strategy;

var path = require('path');
var fs    = require('fs');
var app = express();
var room = "";
var nickname = "";

// Configuration-----------------------
app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.use(express.favicon());
    
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', { layout: false });

    app.use(express.logger());
    app.use(express.bodyParser());
    app.use(express.methodOverride());

    app.use(express.cookieParser('your secret here'));
    app.use(express.session());

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

var server = http.createServer(app).listen(app.get('port'), function () {
    console.log("Serwer nasłuchuje na porcie " + app.get('port'));
});
// var photos ={};
var io  = require('socket.io');
io = io.listen(server); 

//database---------------------------------
// Connect mongoose
mongoose.connect('mongodb://localhost/passport_local_mongoose_examples');

var db = mongoose.connection;
var Photo = new Schema({
      photoName: String,
      src: String,
      mark: Number,
      ownerId: String,
      inBoard: Boolean
});
var photoModel= mongoose.model('Photo',Photo);

db.on('error', console.error.bind(console, 'connection error:'));

//------------------------------------------

//socketio----------------

io.sockets.on('connection', function (socket) {
//     var db = mongoose.connection;
// var Photo = new Schema({
//       photoName: String,
//       src: String,
//       mark: Number,
//       ownerId: String,
//       inBoard: Boolean
// });
// var photoModel= mongoose.model('Photo',Photo);
//rooms-----------------------------------
  // var clients = io.sockets.clients();
 socket.on('room', function(room) {
        socket.join(room);
        //socket.emit('connectedClients',clients);
        console.log('dolaczyles do pokoju '+room);
    }); 

 socket.on('newRoom',function (newRoom){
       socket.join(newRoom);
       // socket.emit('connectedClients',clients);
       console.log('stary pokoj to '+room);
      console.log('nowy pokoj to newroom '+newRoom +' room= '+room);
    });

// socket.on('message',function(wiad) {
//         console.log(wiad);
//        io.sockets.in(room).emit('messageToAll', wiad);
//        console.log('wyslalem wiadomosc '+ wiad+ ' do '+ room);
//     });
//------------------------------------------
socket.on('newPhoto',function (userName,photoNm,src){           
        var photo = new photoModel({
            photoName: photoNm ,
            src: src,
            mark: 0,
            ownerId: userName,
            inBoard: false
        });
        photo.save(function (err, item) {
            console.log(item);
        });
    console.log("photoName "+photoNm+" name "+userName+" src "+src);
    photoModel.findOne({src: src}).exec(function (err, photo){
            console.log(photo);
            socket.emit('showPhoto',photo);
        });
});

// socket.on('countPhoto',function (userName){
//  photoModel.count({ ownerId: userName }, function (err, count) {
//     console.log(count);
//     if(count!==0){socket.emit('countToClient',count);}
//  });   
// });


socket.on('loadPhoto',function (userName){
    // console.log(userName); 
    photoModel.find({ownerId: userName,inBoard: false}).exec(function (err, photo){
           console.log(photo);
           socket.emit('showLoadedPhoto',photo);
    });
});

socket.on('loadPhotoBoard',function (userName){
    console.log('photo from board of user '+userName); 
    photoModel.find({ownerId: userName,inBoard: true}).exec(function (err, photo){
           console.log(photo);
           socket.emit('showLoadedBoardPhoto',photo);
    });
});

socket.on('resetHistory',function (userName){
    photoModel.remove({ownerId: userName}).exec();
    console.log('usuwanie zdjec uzytkownika '+userName);
});


    // socket.on('disconnect', function() {
    //   delete photos[socket.id];
    //   socket.broadcast.emit("disconnectUser", socket.id);
    //    });

    socket.on('newOnBoard', function (id){      
        console.log(id); 
        photoModel.findOneAndUpdate({_id: id},{ $set: { inBoard: true }}).exec(function (err, photo){
                 console.log(photo);
              socket.broadcast.emit('boardToAll',photo);
        });  
    });

        // socket.on('movePhoto', function (x,y) {
        // console.log('server x '+ x);
        // console.log('server y '+ y);       
        // // if(typeof photos!='undefined'){
        // // photos[socket.id].x = x;
        // // photos[socket.id].y = y;
        // socket.broadcast.emit('updatePhotoPosition', x,y);
        // // }
        // });
  });


// Configure passport
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));

passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// Setup routes
require('./routes')(app);
