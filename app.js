// this is where we will use the Express Framework to create  a server that listens for incoming requests.

const express = require('express')
const session = require('express-session')
const app = express()

// configuration options for session
let sessionOptions = session({
   secret: "Javascript secret waystar",
   resave: false,
   saveUninitialized: false,
   cookie: {maxAge: 1000 * 60 * 60 * 24, httpOnly: true}  
})
// maxAge: 1000milliseconds = 1second,* 60 = 1minute,*60 = 1hour,*24 = 1day,
// so here, cookie expires in 1 day.

app.use(sessionOptions)

const router = require('./router')

app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(express.static('public'))

app.set('views', 'views') // now express knows to look into views Folder to find our Templates
app.set('view engine', 'ejs')

app.use('/', router)

module.exports = app