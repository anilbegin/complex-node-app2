const User = require('../models/User')
const Post = require('../models/Post')
const Follow = require('../models/Follow')

exports.sharedProfileData = async function(req, res, next) {
  let isVisitorsProfile = false
  let isFollowing = false
  if(req.session.user) {
    isVisitorsProfile = req.profileUser._id.equals(req.session.user._id)
  isFollowing = await Follow.isVisitorFollowing(req.profileUser._id, req.visitorId)
  }
  req.isVisitorsProfile = isVisitorsProfile
  req.isFollowing = isFollowing
  next()
}

exports.mustBeLoggedIn = function(req, res, next) {
  if(req.session.user) {
    next()
  } else {
    req.flash("errors", "You must be logged in, to perform that action")
    req.session.save(function() {
      res.redirect('/')
    })
  }
}

exports.login = function(req, res) {
  let user = new User(req.body)
  user.login().then(function(result) {
    req.session.user = {avatar: user.avatar, username: user.data.username, _id: user.data._id}
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
    req.session.user = {username: user.data.username, avatar: user.avatar, _id: user.data._id}
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
    res.render('home-dashboard')
  } else {
    res.render('home-guest', {regErrors: req.flash('regErr')})
  }
}

exports.ifUserExists = function(req, res, next) {
  User.findByUsername(req.params.username).then(function(userDocument) {
    req.profileUser = userDocument
    next()
  }).catch(function() {
    res.render('404')
  })
}

exports.profilePostsScreen = function(req, res) {
  // ask our post model for posts by a cerain authorID
  Post.findByAuthorId(req.profileUser._id).then(function(posts) {
    res.render('profile', {
      posts: posts,
      profileUsername: req.profileUser.username,
      profileAvatar: req.profileUser.avatar,
      isFollowing: req.isFollowing,
      isVisitorsProfile: req.isVisitorsProfile
    })
  }).catch(function() {
    res.render('404')
  })
}

exports.profileFollowersScreen = async function(req, res) {
  try {
    let followers = await Follow.getFollowersById(req.profileUser._id)
    res.render('profile-followers', {
    followers: followers,
      profileUsername: req.profileUser.username,
      profileAvatar: req.profileUser.avatar,
      isFollowing: req.isFollowing,
      isVisitorsProfile: req.isVisitorsProfile
  })
  } catch {
    res.render("404")
  }
}