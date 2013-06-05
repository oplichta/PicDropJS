/*jshint node: true */
var path = require('path'),   
    express = require('express'),
    http = require('http'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    Schema = mongoose.Schema,
    LocalStrategy = require('passport-local').Strategy,
    passportLocalMongoose = require('../../lib/passport-local-mongoose.js');

var path = require('path');
var fs    = require('fs');
var app = express();
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
      inBoard: Boolean,
      room: String
});

var photoModel= mongoose.model('Photo',Photo);
var userRoom = new Schema({
     userName: String,
      room: String
});
var userModel= mongoose.model('UserRoom',userRoom);

db.on('error', console.error.bind(console, 'connection error:'));

//------------------------------------------

//socketio----------------

io.sockets.on('connection', function (socket) {

//rooms-----------------------------------

socket.on('saveRoom',function (userName,room){
        var user= new userModel({
             userName: userName,
             room: room
        });
        user.save(function (err, item) {
            console.log('zapisalem '+userName+' w pokoju '+item);
        });
});

socket.on('whatRoom',function (userName){ 
        userModel.findOne({userName: userName}, function (err, item) {
            if (err) { console.log('Błąd odczytu'); }
            if (item) {
               socket.emit('readRoom',item);
               socket.join(item.room);   
               console.log('osoba '+userName+' dolaczyla do pokoju '+item.room);
            } else {
               console.log('nic ciekawego');
               socket.emit('readRoom','Globalny');
            }
        });    
});

 socket.on('newRoom',function (newRoom,userName){       
        userModel.findOneAndUpdate({userName: userName},{ $set: { room: newRoom}}).exec(function (err, item){
        socket.join(item.room);
        console.log(userName+' dołączył do pokoju '+item.room);
        });  
    });

//------------------------------------------
socket.on('newPhoto',function (userName,photoNm,src){           
    userModel.findOne({userName: userName}).exec(function (err, item){      
        var photo = new photoModel({
            photoName: photoNm ,
            src: src,
            mark: 0,
            ownerId: userName,
            inBoard: false,
            room: item.room
        });
        photo.save(function (err, item) {
            console.log(item);
        });
        console.log("photoName "+photoNm+" name "+userName+" src "+src+"room "+item.room);
        photoModel.findOne({src: src},function (err, photo){
            if (err) { console.log('Błąd odczytu'); }
            if (item) {
            console.log('wysyłam do pokoju item.room= :'+item.room)
            socket.join(item.room);
             socket.emit('showPhoto',photo);
            }
        });
    });
});

    socket.on('newOnBoard', function (id,room){      
            console.log(id); 
            photoModel.findOneAndUpdate({_id: id},{ $set: { inBoard: true,room: room}}).exec(function (err, photo){
                     console.log(photo);
                     socket.join(room);
                socket.broadcast.to(room).emit('boardToAll',photo);
            });  
     });

    socket.on('loadPhoto',function (userName,room){
        var counted;
         photoModel.count({ ownerId: userName,inBoard: false,room: room }, function (err, count) {
            console.log(count);
            counted=count;
        });
        socket.join(room);
        if(counted!== 0){
            photoModel.find({ownerId: userName,inBoard: false,room: room}).exec(function (err, photo){           
                   socket.emit('showLoadedPhoto',photo,counted);
            });
        }
    });

    socket.on('loadPhotoBoard',function (room){
        var counted;
         photoModel.count({inBoard: true,room: room }, function (err, count) {
            console.log(count);
            counted=count;
        });   
        if(counted!== 0){
            socket.join(room);
            photoModel.find({inBoard: true,room: room}).exec(function (err, photo){
                console.log('wczytuje zdjecia z tablicy w pokoju '+room);
                io.sockets.in(room).emit('showLoadedBoardPhoto',photo,counted);
            });
        }
    });

    socket.on('resetHistory',function (userName){
        photoModel.remove({ownerId: userName}).exec();
        console.log('usuwanie zdjec uzytkownika '+userName);
    });
    
});
//end of socketio-----------------------------------------------
// Configure passport
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));

passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// Setup routes
require('./routes')(app);
