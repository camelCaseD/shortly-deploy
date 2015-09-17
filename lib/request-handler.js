var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config').db;
var User = require('../app/models/user');
var Link = require('../app/models/link');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find().exec(function(err, links) {
    if (err) console.log(err);
    res.send(200, links);
  })
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  Link.find({ url: uri }).exec(function(err, found) {
    if (err) console.log(err);
    if (found.length !== 0) {
      res.send(200, found);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }
        var newLink = Link.create({
          url: uri,
          title: title,
          base_url: req.headers.origin
        }, function (err, newLink) {
          if (err) console.log(err);
          Link.find({_id: newLink._id}).exec(function(err, link) {
            if (err) console.log(err);
            res.send(200, link[0]);
          });
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.find({ username: username })
    .exec(function(err, user) {
      if (err) console.log(err);
      if (user.length === 0) {
        res.redirect('/login');
      } else {
        user = user[0];
        user.comparePassword(password, function(match) {
          if (match) {
            util.createSession(req, res, user);
          } else {
            res.redirect('/login');
          }
        })
      }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.find({ username: username })
    .exec(function(err, user) {
      if (err) console.log(err);
      if (user.length === 0) {
        var newUser = User.create({
          username: username,
          password: password
        }, function(err, newUser) {
          if (err) console.log(err);
          util.createSession(req, res, newUser);
        });
      } else {
        console.log('Account already exists');
        res.redirect('/signup');
      }
    });
};

exports.navToLink = function(req, res) {
  Link.find({ code: req.params[0] }).exec(function(err, link) {
    if (err) console.log(err);
    if (link.length === 0) {
      res.redirect('/');
    } else {
      link = link[0];
      link.update( { $set: { visits: link.visits + 1 }})
        .exec(function(err) {
          if (err) console.log(err);
          return res.redirect(link.get('url'));
        });
    }
  });
};