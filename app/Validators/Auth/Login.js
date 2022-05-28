'use strict'

class Login {
  get rules () {
    return {
      email: 'required|email',
      password: 'required'
    }
  }

  get messages () {
    return {
      'email.required': 'O E-mail é obrigatório!',
      'email.email': 'O E-mail é invalído!',
      'password.required': 'A senha é obrigatória!'
    }
  }
}

module.exports = Login
