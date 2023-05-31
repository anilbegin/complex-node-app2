const bcrypt = require('bcryptjs')
const usersCollection = require('../db').db().collection('users')
const validator = require('validator')

// Constructor
let User = function(data) {
  this.data = data
  this.errors = []
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

User.prototype.validate = async function() {
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
}

User.prototype.register = function() {
  // step 1. Validate User data
  this.cleanUp()
  this.validate()
  // step 2. Only if there are no Validation errors, then save the user data into a database
  if(!this.errors.length) {
    // hash user Password
    let salt = bcrypt.genSaltSync(10)
    this.data.password = bcrypt.hashSync(this.data.password, salt)
    usersCollection.insertOne(this.data)
  }
}

User.prototype.login = function() {
  return new Promise(async (resolve, reject) => {
    this.cleanUp()
    const attemptedUser = await usersCollection.findOne({username: this.data.username})
    if(attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)) {
     resolve("Congrats")
    } else {
     reject("Invalid username/password")
    } 
  })
}

User.prototype.jump = function() {} // this way if there are 100s of objects asking for..
                                  // ..jump function, Javascript will not duplicate the jump..
                                  // ..function, instead every object will just point towards
                                  // or jump access this one jump method.

module.exports = User