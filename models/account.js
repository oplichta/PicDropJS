var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('../../../lib/passport-local-mongoose.js');

var db = mongoose.connection;

var Account = new Schema({
    nickname: String
});

Account.plugin(passportLocalMongoose);

var Model= mongoose.model('Account',Account);
module.exports = mongoose.model('Account', Account);
