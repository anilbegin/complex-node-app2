// Constructor
let User = function(data) {
  this.data = data
  this.errors = []
}

User.prototype.validate = function() {
  if(this.data.username == "") {this.errors.push("You must provide a username.")}
  if(this.data.email == "") {this.errors.push("You must provide a valid email address.")}
  if(this.data.password == "") {this.errors.push("You must provide a password.")}
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