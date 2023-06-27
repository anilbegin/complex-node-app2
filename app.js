// this is where we will use the Express Framework to create  a server that listens for incoming requests.

const express = require('express')
const session = require('express-session')
const MongoStore = require("connect-mongo")  // installed version 4.6.0
const flash = require("connect-flash")
const app = express()
const markdown = require("marked")
const sanitizeHTML = require("sanitize-html")

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
   // make our markdown template available from within ejs templates
   res.locals.filterUserHTML = function(content) {
      return sanitizeHTML(markdown.parse(content), {allowedTags: ['p', 'br', 'ul', 'ol', 'li', 'bold', 'strong', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'], allowedAttribites: {}}) 
   }

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

const server = require('http').createServer(app)

const io = require('socket.io')(server)

io.use(function(socket, next) {
   sessionOptions(socket.request, socket.request.res, next)
})

io.on('connection', function(socket) {
  if(socket.request.session.user) {
      let user = socket.request.session.user
      socket.on('chatMessageFromBrowser', function(data) {
      io.emit('chatMessageFromServer', {message: data.message, username: user.username, avatar: user.avatar})
   })
  }
})

module.exports = server // was before module.exports = app