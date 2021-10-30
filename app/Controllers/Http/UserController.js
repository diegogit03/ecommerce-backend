'use strict'

const UserTransformer = use('App/Transformers/Admin/UserTransformer')

class UserController {

  async me ({ response, transform, auth }) {
    const user = await auth.getUser()
    const userData = await transform.item(user, UserTransformer)
    userData.roles = await user.getRoles()

    return userData
  }

}

module.exports = UserController
