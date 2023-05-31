// its the routers job to list out all the url's or routes that we are on the lookout for..

const express = require('express')
const router = express.Router()

const userController = require('./controllers/userController')

router.get('/', userController.home)
router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/logout', userController.logout)

module.exports = router

