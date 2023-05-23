let User = function(data) {
  this.data = data
  
}

User.prototype.register = function() {
  // before we start the registeration process, we would first want to validate the userdata
}
User.prototype.jump = function() {} // this way if there are 100s of objects asking for..
                                  // ..jump function, Javascript will not duplicate the jump..
                                  // ..function, instead every object will just point towards
                                  // or jump access this one jump method.

module.exports = User