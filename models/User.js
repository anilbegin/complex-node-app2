const bcrypt = require('bcryptjs')
const usersCollection = require('../db').db().collection('users')
const validator = require('validator')
const md5 = require("md5")

// Constructor
let User = function(data, getAvatar) {
  this.data = data
  this.errors = []
  if(getAvatar == undefined) getAvatar = false
  if(getAvatar) this.getAvatar()
}

User.prototype.cleanUp = function() {
  // data submitted by user should only be of String data type, and not an Array or an Object, etc
  if(typeof(this.data.username) != "string") {this.data.username = ""}
  if(typeof(this.data.email) != "string") {this.data.email = ""}
  if(typeof(this.data.password) != "string") {this.data.password = ""}

  // get rid of any bogus properties
  this.data = {
    username: this.data.username.trim().toLowerCase(),
    email: this.data.email.trim().toLowerCase(),
    password: this.data.password
  }
}

User.prototype.validate = function() {
  return new Promise(async (resolve, reject) => {
    if(this.data.username == "") {this.errors.push("You must provide a username.")}
    if(this.data.username != "" && !validator.isAlphanumeric(this.data.username))  {this.errors.push('Username can only contain letters and numbers')}
    if(!validator.isEmail(this.data.email)) {this.errors.push("You must provide a valid email address.")}
    if(this.data.password == "") {this.errors.push("You must provide a password.")}
  
    if(this.data.username.length > 0 && this.data.username.length < 3) {this.errors.push('Username must be atleast 3 characters')}
    if(this.data.username.length > 30) {this.errors.push("Username cannot exceed 30 characters")}
    if(this.data.password.length > 0 && this.data.password.length < 6) {this.errors.push('Password must be atleast 6 characters')}
    if(this.data.password.length > 50) {this.errors.push("Password cannot exceed 50 characters")}
  
    // Only if username is valid then check to see if its already taken
    if(this.data.username.length > 2 && this.data.username.length < 31 && validator.isAlphanumeric(this.data.username)) {
      let usernameExists = await usersCollection.findOne({username: this.data.username})
      if(usernameExists) this.errors.push("that username is already taken")
    }
    // Only if username is valid then check to see if its already taken
    if(validator.isEmail(this.data.email)) {
      let emailExists = await usersCollection.findOne({email: this.data.email})
      if(emailExists) this.errors.push("that email is already being used")
    }
    resolve()
  })
}

User.prototype.register = function() {
  return new Promise(async (resolve, reject) => {
    // step 1. Validate User data
    this.cleanUp()
    await this.validate()
    // step 2. Only if there are no Validation errors, then save the user data into a database
    if(!this.errors.length) {
      // hash user Password
      let salt = bcrypt.genSaltSync(10)
      this.data.password = bcrypt.hashSync(this.data.password, salt)
     await usersCollection.insertOne(this.data)
      this.getAvatar()
      resolve()
    } else {
      reject(this.errors)
    }
  })
}

User.prototype.login = function() {
  return new Promise(async (resolve, reject) => {
    this.cleanUp()
    const attemptedUser = await usersCollection.findOne({username: this.data.username})
    if(attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)) {
    //  console.log(this.data) // { username: 'anil', email: '', password: '123456123456!' }
    // console.log(attemptedUser) // { _id: new ObjectId("6478540a630ae20559d312a0"),
                                // username: 'user',
                                // email: 'user@email.com',
                                // password: 'hashedpass$#$#$#$#%' }
     this.data = attemptedUser
     this.getAvatar() 
     resolve("Congrats")
    } else {
     reject("Invalid username/password")
    } 
  })
}

User.prototype.getAvatar = function() {
  this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`
}

User.findByUsername = function(username) {
  return new Promise(function(resolve, reject) {
    if(typeof(username) != 'string') {
      reject()
      return 
    }
    usersCollection.findOne({username: username}).then(function(userDoc) {
      if(userDoc) {
        userDoc = new User(userDoc, true)  
        userDoc = {
          _id: userDoc.data._id,
          username: userDoc.data.username,
          avatar: userDoc.avatar
        }
        resolve(userDoc)
      } else {
        reject()
      }
    }).catch(function() {
      reject()
    })
  })
}

User.doesEmailExist = function(email) {
  return new Promise(async function(resolve, reject) {
    if(typeof(email) != "string") {
      resolve(false)
      return
    }

    let user = await usersCollection.findOne({email: email})
    if(user) {
      resolve(true)
    } else {
      resolve(false)
    }
  })
}

// trial by me for api route
// returns the total number of registered Users, and their respective Usernames
User.getAllUsers = async function() {
  let allUsers = await usersCollection.find({}).toArray()
  let userCount = await usersCollection.countDocuments({})
  allUsers = allUsers.map(function(user) {
    return user.username
  })
  allUsers = {
    count: userCount,
    users: allUsers
  }
  return allUsers
}

module.exports = User