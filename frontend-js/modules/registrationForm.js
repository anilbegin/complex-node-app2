import axios from 'axios'

export default class RegistrationForm {
  constructor() {
    this.allFields = document.querySelectorAll("#registration-form .form-control")
    this.insertValidationElements()
    this.username = document.querySelector("#username-register")
    this.username.previousValue = ""
    this.email = document.querySelector("#email-register")
    this.email.previousValue = ""
    this.password = document.querySelector("#password-register")
    this.password.previousValue = ""
    this.events()
  }

  // Events
  events() {
    this.username.addEventListener('keyup', () => {
      this.isDifferent(this.username, this.usernameHandler)
    })

    this.email.addEventListener('keyup', () => {
      this.isDifferent(this.email, this.emailHandler)
    })

    this.password.addEventListener('keyup', () => {
      this.isDifferent(this.password, this.passwordHandler)
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
    this.username.errors = false
    this.usernameImmediately()
    clearTimeout(this.username.timer)
    this.username.timer = setTimeout(() => this.usernameAfterDelay(), 800)
  }

  emailHandler() {
    this.email.errors = false
    clearTimeout(this.email.timer)
    this.email.timer = setTimeout(() => this.emailAfterDelay(), 800)
  }

  passwordHandler() {
    this.password.errors = false
    this.passwordImmediately()
    clearTimeout(this.password.timer)
    this.password.timer = setTimeout(() => this.passwordAfterDelay(), 800)
  }

  insertValidationElements() {
    this.allFields.forEach(function(el) {
      el.insertAdjacentHTML('afterend', '<div class="alert alert-danger small liveValidateMessage"></div>')
    })
  }

  usernameImmediately() {
   if(this.username.value != "" && !/^([a-zA-Z0-9]+)$/.test(this.username.value)) {
     this.showValidationError(this.username, "Username can only contain letters and numbers")
   }

   if(this.username.value.length > 30) {
    this.showValidationError(this.username, "Username cannot exceed 30 characters")
   }

   if(!this.username.errors) {
    this.hideValidationError(this.username)
   }
  }

  passwordImmediately() {
    if(this.password.value.length > 50) {
      this.showValidationError(this.password, "Password cannot exceed 50 characters")
    }

    if(!this.password.errors) {
      this.hideValidationError(this.password)
    }
  }

  usernameAfterDelay() {
   if(this.username.value.length < 3) {
    this.showValidationError(this.username, "Username must be atleast 3 characters")
   }

   if(!this.username.errors) {
    axios.post('/doesUsernameExist', {username: this.username.value}).then((response) => {
      if(response.data) {
        this.showValidationError(this.username, "That username is already taken")
        this.username.isUnique = false
      } else {
        this.username.isUnique = true
      }
    }).catch(() => {
      console.log("Please try again later")
    })
   }
  }

  emailAfterDelay() {
    if(!/^[a-zA-Z0-9]+\.?[a-zA-Z0-9]+@(yahoo|ymail|rocketmail|gmail|rediffmail|outlook|live|hotmail)\.com$/.test(this.email.value)) {
      this.showValidationError(this.email, "Please provide a valid email address")
    }

    if(!this.email.errors) {
      axios.post('/doesEmailExist', {email: this.email.value}).then((response) => {
        if(response.data) {
          this.email.isUnique = false
          this.showValidationError(this.email, "That email is already being used")
        } else {
          this.email.isUnique = true
          this.hideValidationError(this.email)
        }
      }).catch(() => {
        console.log("Please try again later")
      })
    }
  }

  passwordAfterDelay() {
    if(this.password.value.length < 6) {
      this.showValidationError(this.password, "Password must be atleast 6 characters")
    }
  }

  showValidationError(el, message) {
    el.nextElementSibling.innerHTML = message
    el.nextElementSibling.classList.add("liveValidateMessage--visible")
    el.errors = true
  }

  hideValidationError(el) {
    el.nextElementSibling.classList.remove("liveValidateMessage--visible")
  }
}