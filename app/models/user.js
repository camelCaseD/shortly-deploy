var db = require('../config').db;
var schema = require('../config').userSchema;
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

schema.post('save', function (doc) {
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(doc.get('password'), null, null).bind(this)
    .then(function(hash) {
      // doc.update('password', hash);
      doc.update({
        $set: {
          password: hash
        }
      }, function (err) {
        if (err) console.log("Wowzers. You really messed this up: " + err);
      });
    });
});

schema.methods.comparePassword = function (attemptedPassword, callback) {
  bcrypt.compare(attemptedPassword, this.password, function(err, isMatch) {
    callback(isMatch);
  });
};

var User = db.model('User', schema);
  // tableName: 'users',
  // hasTimestamps: true,
  // initialize: function(){
  //   this.on('creating', this.hashPassword);
  // },
  // comparePassword: function(attemptedPassword, callback) {
  //   bcrypt.compare(attemptedPassword, this.get('password'), function(err, isMatch) {
  //     callback(isMatch);
  //   });
  // },
  // hashPassword: function(){
  //   var cipher = Promise.promisify(bcrypt.hash);
  //   return cipher(this.get('password'), null, null).bind(this)
  //     .then(function(hash) {
  //       this.set('password', hash);
  //     });
  // }


module.exports = User;
