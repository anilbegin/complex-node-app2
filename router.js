// its the routers job to list out all the url's or routes that we are on the lookout for..

const express = require('express')

const router = express.Router() 

router.get('/', function(req, res) {
    res.render('home-guest')
})

module.exports = router