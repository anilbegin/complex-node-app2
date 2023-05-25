const validator = require('validator')

// Constructor
let User = function(data) {
  this.data = data
  this.errors = []
}

User.prototype.validate = function() {
  if(this.data.username == "") {this.errors.push("You must provide a username.")}
  if(this.data.username != "" && !validator.isAlphanumeric(this.data.username))  {this.errors.push('Username can only contain letters and numbers')}
  if(!validator.isEmail(this.data.email)) {this.errors.push("You must provide a valid email address.")}
  if(this.data.password == "") {this.errors.push("You must provide a password.")}

  if(this.data.username.length > 0 && this.data.username.length < 3) {this.errors.push('Username must be atleast 3 characters')}
  if(this.data.username.length > 30) {this.errors.push("Username cannot exceed 30 characters")}
  if(this.data.password.length > 0 && this.data.password.length < 6) {this.errors.push('Password must be atleast 6 characters')}
  if(this.data.password.length > 50) {this.errors.push("Passwword cannot exceed 50 characters")}

}

User.prototype.register = function() {
  // step 1. Validate User data
  this.validate()
  // step 2. Only if there are no Validation errors, then save the user data into a database
}
User.prototype.jump = function() {} // this way if there are 100s of objects asking for..
                                  // ..jump function, Javascript will not duplicate the jump..
                                  // ..function, instead every object will just point towards
                                  // or jump access this one jump method.

module.exports = User