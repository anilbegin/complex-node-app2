const User = require('../models/User')

exports.login = function() {
  
}

exports.logout = function() {

}

exports.register = function(req, res) {
  let user = new User() // calling the constructor function
  let user2 = new User()
  let user3 = new User()
  user.homePlanet
  res.send('Thanks for trying to register')
}

exports.home = function(req, res) {
  res.render('home-guest')
}