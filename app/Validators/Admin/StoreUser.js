'use strict'

class StoreUser {
  get rules () {
    let userID = this.ctx.params.id
    let rule = ''
    // Significa que o usuario está sendo atualizado
    if (userID) {
      rule = `unique:users,email,id,${userID}`
    } else {
      rule = `required|unique:users,email`
    }

    return {
      email: rule,
      image_id: 'exists:images,id'
    }
  }

  get messages () {
    return {
      'email.unique': 'Este E-mail ja existe!',
      'email.required': 'O E-mail é obrigatório!',
      'image_id.exists': 'A imagem não existe!'
    }
  }
}

module.exports = StoreUser
