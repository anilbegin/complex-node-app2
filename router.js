// its the routers job to list out all the url's or routes that we are on the lookout for..

const express = require('express')
const router = express.Router()

const userController = require('./controllers/userController')
const postController = require('./controllers/postController')

// user related routes
router.get('/', userController.home)
router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/logout', userController.logout)

// profile related routes
router.get('/profile/:username', userController.ifUserExists, userController.profilePostsScreen)

//post related routes
router.get('/create-post', userController.mustBeLoggedIn, postController.createPostScreen)
router.post('/create-post', userController.mustBeLoggedIn, postController.create)
router.get('/post/:id', postController.viewSingle)
router.get('/post/:id/edit', postController.goToEditPost)
router.post('/post/:id/edit', postController.editPost)

module.exports = router

