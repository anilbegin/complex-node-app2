const { ObjectId } = require('mongodb')

const usersCollection = require('../db').db().collection('users')
const followsCollection = require('../db').db().collection('follows')

let Follow = function(followedUsername, authorId) {
  this.followedUsername = followedUsername
  this.authorId = authorId
  this.errors = []
}



Follow.prototype.validate = async function() {
  // followedUsername must exist in Database
  console.log(this.followedUsername) // 'hello' gets printed but, empty on followedUsername
  let followedAccount = await usersCollection.findOne({username: this.followedUsername})
  if(followedAccount) {
    
    this.followedId = followedAccount._id
  } else {
    this.errors.push("you cannot follow a user that does not exist")
  }
}

Follow.prototype.create = function() {
  return new Promise(async (resolve, reject) => {
   
   await this.validate()
    if(!this.errors.length) {
     await followsCollection.insertOne({followedId: this.followedId, authorId: new ObjectId(this.authorId)})
     resolve() 
    } else {
      reject(this.errors)
    }
  })
}

module.exports = Follow