const dotenv = require('dotenv')
dotenv.config()
const {MongoClient} = require('mongodb')


const client = new MongoClient(process.env.CONNECTIONSTRING)
const port = process.env.PORT

async function start() {
  await client.connect()
  module.exports = client.db() // making the 'db' available to other files
  const app = require('./app')
  app.listen(port) 
}

start()
