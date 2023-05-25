// Constructor
let User = function(data) {
  this.data = data
  
}

User.prototype.register = function() {
  // step 1. Validate User data

  // step 2. Only if there are no Validation errors, then save the user data into a database
}
User.prototype.jump = function() {} // this way if there are 100s of objects asking for..
                                  // ..jump function, Javascript will not duplicate the jump..
                                  // ..function, instead every object will just point towards
                                  // or jump access this one jump method.

module.exports = User