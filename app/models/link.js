var db = require('../config').db;
var schema = require('../config').linksSchema;
var crypto = require('crypto');

schema.post('save', function (doc) {
  var shasum = crypto.createHash('sha1');
  shasum.update(doc.url);
  doc.update({
    $set: {
      code: shasum.digest('hex').slice(0, 5),
      visits: 0
    }
  }, function (err) {
    if (err) console.log("This is what went terribly, terribly wrong: " +err);
  });
});

var Link = db.model('Link', schema);

module.exports = Link;
