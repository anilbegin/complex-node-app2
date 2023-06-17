const Post = require('../models/Post')

exports.createPostScreen = function(req, res) {
  res.render('create-post')
}

exports.create = function(req, res) {
  let post = new Post(req.body, req.session.user._id)

  post.create().then(function() {
    res.send("New post created")
  }).catch(function(errors) {
    res.send(errors)
  })
}

exports.viewSingle = async function(req, res) {
  try {
    let post = await Post.findSinglePostById(req.params.id, req.visitorId)
    res.render('view-single-post', {post: post})
  } catch {
    res.render('404')
  }
}

exports.editPost = async function(req, res) {
  try {
    let post = await Post.findSinglePostById(req.params.id)
    res.render("edit-post", {post: post})
  } catch {
    res.render("404")
  }
}