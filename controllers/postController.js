const Post = require('../models/Post')
const postmark = require("postmark")
let client = new postmark.ServerClient(process.env.POSTMARKTOKEN)

exports.createPostScreen = function(req, res) {
  res.render('create-post')
}

exports.create = function(req, res) {
  let post = new Post(req.body, req.session.user._id)

  post.create().then((newId) => {
    client.sendEmail({
      "From": "WriteApp anil@anilforwork.in",
      "To": "anilforwork@hotmail.com",
      "Subject": "New Post Created",
      "TextBody": "Congratulations, you have created a new post."
    })
    req.flash("success", "new post successfully created")
    req.session.save(() => res.redirect(`/post/${newId}`))
  }).catch(function(errors) {
    errors.forEach(error => req.flash("errors", error))
    req.session.save(() => res.redirect("/create-post"))
  })
}

exports.viewSingle = async function(req, res) {
  try {
    let post = await Post.findSinglePostById(req.params.id, req.visitorId)
    res.render('view-single-post', {post: post, title: post.title})
  } catch {
    res.render('404')
  }
}

// going to the Edit Post page, and fetching the title and body for that Post
exports.goToEditPost = async function(req, res) {
  try {
    let post = await Post.findSinglePostById(req.params.id, req.visitorId)
    if(post.isVisitorOwner) {
      res.render("edit-post", {post: post})
    } else {
      req.flash('errors', "you do not have permission to perform that action")
      req.session.save(() => res.redirect("/"))
    }
  } catch {
    res.render("404")
  }
}

// Updating the Post
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

exports.deletePost = function(req, res) {
  Post.delete(req.params.id, req.visitorId).then(() => {
    req.flash("success", "Post successfully deleted")
    req.session.save(() => res.redirect(`/profile/${req.session.user.username}`))
  }).catch(() => {
    req.flash("errors", "you do not have permission to perform that action")
    req.session.save(() => res.redirect("/"))
  })
}

exports.search = function(req, res) {
 Post.search(req.body.searchTerm).then(posts => {
    res.json(posts)
  }).catch(() => {
    res.json([])
  })
}


// API Section 

exports.apiCreate = function(req, res) {
  let post = new Post(req.body, req.apiUser._id)

  post.create().then((newId) => {
    res.json("Congrats")
  }).catch(function(errors) {
    res.json(errors)
  })
}

exports.apiDelete = function(req, res) {
  Post.delete(req.params.id, req.apiUser._id).then(() => {
    res.json("Delete Success")
  }).catch(() => {
    res.json("You do not have permission to perform that action")
  })
}