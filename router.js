// its the routers job to list out all the url's or routes that we are on the lookout for..

const express = require('express')
const router = express.Router()

const userController = require('./controllers/userController')
const postController = require('./controllers/postController')
const followController = require('./controllers/followController')

// user related routes
router.get('/', userController.home)
router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/logout', userController.logout)

// profile related routes
router.get('/profile/:username', userController.ifUserExists, userController.sharedProfileData, userController.profilePostsScreen)

//post related routes
router.get('/create-post', userController.mustBeLoggedIn, postController.createPostScreen)
router.post('/create-post', userController.mustBeLoggedIn, postController.create)
router.get('/post/:id', postController.viewSingle)
router.get('/post/:id/edit', userController.mustBeLoggedIn, postController.goToEditPost)
router.post('/post/:id/edit', userController.mustBeLoggedIn, postController.editPost)
router.post('/post/:id/delete', userController.mustBeLoggedIn, postController.deletePost)
router.post('/search', postController.search)

// follow related routes
router.post('/addFollow/:username', userController.mustBeLoggedIn, followController.addFollow)
router.post('/removeFollow/:username', userController.mustBeLoggedIn, followController.removeFollow)

module.exports = router

