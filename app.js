// this is where we will use the Express Framework to create  a server that listens for incoming requests.

const express = require('express')

const app = express()

app.get('/', function(req, res) {
  res.send("Welcome to our new app.")
})

app.listen(3000)
