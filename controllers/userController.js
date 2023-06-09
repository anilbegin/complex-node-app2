const User = require('../models/User')
const Post = require('../models/Post')
const Follow = require('../models/Follow')
const jwt = require("jsonwebtoken")

exports.sharedProfileData = async function(req, res, next) {
  let isVisitorsProfile = false
  let isFollowing = false
  if(req.session.user) {
    isVisitorsProfile = req.profileUser._id.equals(req.session.user._id)
  isFollowing = await Follow.isVisitorFollowing(req.profileUser._id, req.visitorId)
  }
  req.isVisitorsProfile = isVisitorsProfile
  req.isFollowing = isFollowing

  // retrieve post follower and following counts
  let postCountPromise = Post.countPostsByAuthor(req.profileUser._id)
  let followerCountPromise = Follow.countFollowersById(req.profileUser._id)
  let followingCountPromise = Follow.countFollowingById(req.profileUser._id)
  let [postCount, followerCount, followingCount] = await Promise.all([postCountPromise, followerCountPromise, followingCountPromise])
  
  req.postCount = postCount
  req.followerCount = followerCount
  req.followingCount = followingCount

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

exports.home = async function(req, res) {
  if(req.session.user) {
    // fetch feed of posts for current User, i.e the posts that are created by accounts that this user follows
    let posts = await Post.getFeed(req.session.user._id)
    res.render('home-dashboard', {posts: posts})
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

// all the Posts created by a User 
exports.profilePostsScreen = function(req, res) {
  // ask our post model for posts by a cerain authorID
  Post.findByAuthorId(req.profileUser._id).then(function(posts) {
    res.render('profile', {
    title: `Posts from: ${req.profileUser.username}`,  
    currentPage: "posts",  
      posts: posts,
      profileUsername: req.profileUser.username,
      profileAvatar: req.profileUser.avatar,
      isFollowing: req.isFollowing,
      isVisitorsProfile: req.isVisitorsProfile,
      counts: {postCount: req.postCount, followerCount: req.followerCount, followingCount: req.followingCount}
    })
  }).catch(function() {
    res.render('404')
  })
}

// returns profile info about all the followers of a particular User 
exports.profileFollowersScreen = async function(req, res) {
  try {
    let followers = await Follow.getFollowersById(req.profileUser._id)
    res.render('profile-followers', {
    title: `followers of: ${req.profileUser.username}`, 
    currentPage: "followers",  
    followers: followers,
      profileUsername: req.profileUser.username,
      profileAvatar: req.profileUser.avatar,
      isFollowing: req.isFollowing,
      isVisitorsProfile: req.isVisitorsProfile,
      counts: {postCount: req.postCount, followerCount: req.followerCount, followingCount: req.followingCount}
  })
  } catch {
    res.render("404")
  }
}

// returns info on the profiles that a User Follows
exports.profileFollowingScreen = async function(req, res) {
  try {
    let following = await Follow.getFollowingById(req.profileUser._id)
    res.render('profile-following', {
    title: `followings from: ${req.profileUser.username}`,   
    currentPage: "following",
    following: following,
      profileUsername: req.profileUser.username,
      profileAvatar: req.profileUser.avatar,
      isFollowing: req.isFollowing,
      isVisitorsProfile: req.isVisitorsProfile,
      counts: {postCount: req.postCount, followerCount: req.followerCount, followingCount: req.followingCount}
  })
  } catch {
    res.render("404")
  }
}

exports.doesUsernameExist = function(req, res) {
  User.findByUsername(req.body.username).then(function() {
    res.json(true)
  }).catch(function() {
    res.json(false)
  })
}

exports.doesEmailExist = async function(req, res) {
 let emailBool = await User.doesEmailExist(req.body.email)
 res.json(emailBool)
}

// API Section

exports.apiLogin = function(req, res) {
  let user = new User(req.body)
  user.login().then(function(result) {
    res.json(jwt.sign({_id: user.data._id}, process.env.JWTSECRET, {expiresIn: '1d'}))
  }).catch(function(err) {
    //res.send(err)
    res.json("Sorry your values are incorrect")
  })
}

exports.apiMustBeLoggedIn = function(req, res, next) {
  try {
   req.apiUser = jwt.verify(req.body.token, process.env.JWTSECRET)
   next()
  } catch {
    res.json("Sorry you must provide a valid token")
  }
}

exports.apiGetPostsByUsername = async function(req, res) {
  try {
    let authorDoc = await User.findByUsername(req.params.username)
    let posts = await Post.findByAuthorId(authorDoc._id)
    res.json(posts)
  } catch {
    res.json("Sorry Invalid user requested")
  }
}

// additional trial by me for api route
//  returns an Object with total number of users, and an array of respective Usernames
// eg: { "total": 4, "users": ["abc", "def", "ghi", "jkl"]}
exports.apiUsers = async function(req, res) {
  try {
    let users = await User.getAllUsers()
    res.json(users)
  } catch {
    res.json('There seems to be some problem')
  }
}
