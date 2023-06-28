export default class RegistrationForm {
  constructor() {
    this.allFields = document.querySelectorAll("#registration-form .form-control")
    this.insertValidationElements()
    this.username = document.querySelector("#username-register")
    this.username.previousValue = ""
    this.events()
  }

  // Events
  events() {
    this.username.addEventListener('keyup', () => {
      this.isDifferent(this.username, this.usernameHandler)
    })
  } 

  // Methods
  // isDifferent -  check if the key press is actually a character and not the arrow key, capslock, end, Tab, etc
  isDifferent(el, handler) {
    if(el.previousValue != el.value) {
      handler.call(this)
    }
    el.previousValue = el.value
  } 

  // usernameHandler -  triggered by isDifferent function
  usernameHandler() {
    alert("Username handler just ran")
  }

  insertValidationElements() {
    this.allFields.forEach(function(el) {
      el.insertAdjacentHTML('afterend', '<div class="alert alert-danger small liveValidateMessage"></div>')
    })
  }
}