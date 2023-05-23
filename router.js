// its the routers job to list out all the url's or routes that we are on the lookout for..

const express = require('express')

const router = express.Router() 

router.get('/', function(req, res) {
    res.render('home-guest')
})

router.get('/about', function(req, res) {
  res.send('This is the about page') 
})   // going to localhost:3000/about .. will now show "This is the about page"

router.post('/create-post', postController.create) 
// someone sends a post request to create post.. 
// ..then our router can look inside the 'postController' for the 'create' function that we have inside that file
router.post('/login', userController.login)
// if a user wants to login, so browser sends a post request to the url of /login ..
// .. then our router will lokk inside the 'userController' for its function named 'login'

module.exports = router

