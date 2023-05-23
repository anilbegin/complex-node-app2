// this is where we will use the Express Framework to create  a server that listens for incoming requests.

const express = require('express')
const app = express()

const router = require('./router')
console.log(router) // whatever you export is going to get stored in the variable you used for require, in this case its a variable named 'router'
app.use(express.static('public'))

app.set('views', 'views') // now express knows to look into views Folder to find our Templates
app.set('view engine', 'ejs')

app.get('/', function(req, res) {
  res.render('home-guest')
})

app.listen(3000)
