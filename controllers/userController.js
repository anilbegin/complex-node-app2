const User = require('../models/User')

exports.login = function() {
  
}

exports.logout = function() {

}

exports.register = function(req, res) {
  let user = new User(req.body) // calling the constructor function
                //new User(req.body) -here we are just passing form field values that user just submitted to the new User Object
  user.register()
  res.send('Thanks for trying to register')
}

exports.home = function(req, res) {
  res.render('home-guest')
}