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

exports.goToEditPost = async function(req, res) {
  try {
    let post = await Post.findSinglePostById(req.params.id)
    res.render("edit-post", {post: post})
  } catch {
    res.render("404")
  }
}

exports.editPost = function(req, res) {
  let post = new Post(req.body, req.visitorId, req.params.id)
  post.update().then((status) => {
    // post was succesfully updated in the DB
    // or user did have permission but there were validation errors
    if(status == "success") {
      // post was updated in DB
      req.flash("success", "Post successfully updated")
      req.session.save(function() {
        res.redirect(`/post/${req.params.id}/edit`)
      })
    } else {
      // 
      post.errors.forEach(function(error) {
        req.flash("errors", error)
        req.session.save(function() {
          res.redirect(`/post/${req.params.id}/edit`)
        })
      })
    }
  }).catch(() => {
    // a post with a requested Id does not exist
    // or if the current visitor is not the owner of the requested post
    req.flash("errors", " You dont have permission to perform that action.")
    req.session.save(function() {
      res.redirect("/")
    })
  })
}