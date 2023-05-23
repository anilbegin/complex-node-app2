// this is where we will use the Express Framework to create  a server that listens for incoming requests.

const express = require('express')
const app = express()

const router = require('./router')

app.use(express.static('public'))

app.set('views', 'views') // now express knows to look into views Folder to find our Templates
app.set('view engine', 'ejs')

app.use('/', router)

app.listen(3000)
