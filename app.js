// this is where we will use the Express Framework to create  a server that listens for incoming requests.

const express = require('express')
const session = require('express-session')
const MongoStore = require("connect-mongo")  // installed version 4.6.0
const flash = require("connect-flash")
const app = express()

// configuration options for session
let sessionOptions = session({
   secret: "Javascript secret waystar",
   store: MongoStore.create({client: require("./db")}),
   resave: false,
   saveUninitialized: false,
   cookie: {maxAge: 1000 * 60 * 60 * 24, httpOnly: true}  
})
// maxAge: 1000milliseconds = 1second,* 60 = 1minute,*60 = 1hour,*24 = 1day,
// so here, cookie expires in 1 day.

app.use(sessionOptions)
app.use(flash())

app.use(function(req, res, next) {
   // make all error and success flash messages available from all templates
   res.locals.errors = req.flash("errors")
   res.locals.success = req.flash("success")

   //make current userID avaiable on the req object.
   if(req.session.user) {req.visitorId = req.session.user._id} else {req.visitorId = 0}
   // make user session data avaiable from within 'view' templates
   res.locals.user = req.session.user
   
   next()
})

const router = require('./router')

app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(express.static('public'))

app.set('views', 'views') // now express knows to look into views Folder to find our Templates
app.set('view engine', 'ejs')

app.use('/', router)

module.exports = app