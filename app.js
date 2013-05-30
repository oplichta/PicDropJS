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
var nickname = ""

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
var photos ={};
var io  = require('socket.io');
io = io.listen(server); 

// Connect mongoose
mongoose.connect('mongodb://localhost/passport_local_mongoose_examples');

//database---------------------------------
var db = mongoose.connection;
var Photo = new Schema({
      photoName: String,
      src: String,
      mark: Number,
      ownerId: String
});
var photoModel= mongoose.model('Photo',Photo);
//zapis
// db.on('open', function () {        
//         var james = new photoModel({
//             photoName: "photoNam" ,
//             src: 'costam zrodldo',
//             mark: 3,
//             ownerId: "name"
//         });
//         james.save(function (err, item) {
//             console.log(item);
//            db.close();
//         });
//     });

db.on('error', console.error.bind(console, 'connection error:'));
   //usuwanie             
// db.on('open', function () {
//         Model.findOneAndRemove({nickname: "James"}).exec(function (err, person){
//             console.log(person);
        
//      //  db.close();
//     });
// });

// db.on('remove', function(){
//  Model.remove(function ( err, item) {
//   if (err) return handleError(err)
//   Model.findById('51a72e20e8e6b3280a000001', function (err, item) {
//     console.log(item+'wywalilo'); // null
//   });
// });
// });
//------------------------------------------

//socketio----------------

io.sockets.on('connection', function (socket) {
    var db = mongoose.connection;
var Photo = new Schema({
      photoName: String,
      src: String,
      mark: Number,
      ownerId: String
});
var photoModel= mongoose.model('Photo',Photo);
//zapis

// socket.on('newRoom',function(newRoom){
//    console.log('stary pokoj to '+room);
//    room=newRoom; 
//   console.log('nowy pokoj to newroom '+newRoom +' room= '+room);

// });

socket.on('newPhoto',function (userName,photoNm,src){           
        var james = new photoModel({
            photoName: photoNm ,
            src: src,
            mark: 3,
            ownerId: userName
        });
        james.save(function (err, item) {
            console.log(item);
        });
    console.log("photoName "+photoNm+" name "+userName+" src "+src);
    photoModel.findOne({src: src}).exec(function (err, photo){
            console.log(photo);
            socket.emit('showPhoto',photo);
        });
    
});

socket.on('loadPhoto',function (userName){
    photoModel.find({ownerId: userName}, function (err, photo) {
            console.log(photo);            
            if(photo.userName!== undefined){
            socket.emit('showPhoto',photo);}
        });
});

socket.on('resetHistory',function (userName){
    photoModel.remove({ownerId: userName}).exec();
    console.log('usuwanie zdjec uzytkownika '+userName);
});
//  socket.on('room', function(room) {
//         socket.join(room);
//         console.log('dolaczyles do pokoju '+room);
//     });
// socket.on('message',function(wiad) {
//         console.log(wiad);
//        io.sockets.in(room).emit('messageToAll', wiad);
//        console.log('wyslalem wiadomosc '+ wiad+ ' do '+ room);
//     });
// io.sockets.clients('room');
 

//socket.emit("init", userPhotos);

    // socket.on('disconnect', function() {
    //   delete photos[socket.id];
    //   socket.broadcast.emit("disconnectUser", socket.id);
    //    });

      socket.on('src', function (id){        
        socket.broadcast.emit('searchToAll',photos[id]);
        console.log('wyslalem id '+ photos[id].id);
        console.log('wyslalem src '+ photos[id].src);
        // console.log('wyslalem search'+ photos.search);
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


// Configure passport
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));

passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());



// Setup routes
require('./routes')(app);
