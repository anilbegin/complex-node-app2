const User = require('../models/User')

exports.login = function(req, res) {
  let user = new User(req.body)
  user.login().then(function(result) {
    req.session.user = {avatar: user.avatar, username: user.data.username}
    //res.send(result)
    req.session.save(function() {
      res.redirect('/')
    })
  }).catch(function(err) {
    //res.send(err)
    req.flash('errors', err)
    //the above line will result in adding of flash Object to session Object..i.e req.session.flash.errors = [err]
    req.session.save(function() {
      res.redirect('/')
    })
  })
}

exports.logout = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/')
  })
  
}

exports.register = function(req, res) {
  let user = new User(req.body) // calling the constructor function
                //new User(req.body) -here we are just passing form field values that user just submitted to the new User Object
  user.register().then(() => { // if registration is success 
    req.session.user = {username: user.data.username, avatar: user.avatar}
    req.session.save(function() {
      res.redirect('/')
    })
  }).catch((regErrors) => { // here regErrors is 'this.errors' on Promise reject() from User.prototype.register
    regErrors.forEach(function(err) {
      req.flash('regErr', err)
    })
    req.session.save(function() {
      res.redirect('/')
    })
  })
  
}

exports.home = function(req, res) {
  if(req.session.user) {
    res.render('home-dashboard', {username: req.session.user.username, avatar: req.session.user.avatar})
  } else {
    res.render('home-guest', {errors: req.flash('errors'), regErrors: req.flash('regErr')})
  }
}