let User = function() {
  this.homePlanet = "earth"
  
}

User.prototype.jump = function() {} // this way if there are 100s of objects asking for..
                                  // ..jump function, Javascript will not duplicate the jump..
                                  // ..function, instead every object will just point towards
                                  // or jump access this one jump method.

module.exports = User