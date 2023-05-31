const dotenv = require('dotenv')
dotenv.config()
const {MongoClient} = require('mongodb')


const client = new MongoClient(process.env.CONNECTIONSTRING)
const port = process.env.PORT

async function start() {
  await client.connect()
  module.exports = client //making the 'db' available to other files
                          //*changed client.db() to just client
                          // the change was made while setting sessions to be stored into MongoDB
                          // while setting this, the client property within session method asks for MongoDB client..
                          // ..while our db.js was providing the MongoDB Database with client.db(), ..
                          // .. so for need of the Client we changed "client.db()" to just "client"
                          // ..with this change in place, we also need to change what we are importing within our User model
                          // previously.. const usersCollection = require('../db').collection('users')
                          // changed to..const usersCollection = require('../db').db().collection('users')
  const app = require('./app')
  app.listen(port) 
}

start()
