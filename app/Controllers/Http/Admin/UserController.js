'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const User = use('App/Models/User')
const UserTransformer = use('App/Transformers/Admin/UserTransformer')

/**
 * Resourceful controller for interacting with users
 */
class UserController {
  /**
   * Show a list of all users.
   * GET users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, pagination, transform }) {
    const name = request.input('name')
    const query = User.query()

    if (name) {
      query.where('name', 'LIKE', `%${name}%`)
      query.orWhere('surname', 'LIKE', `%${name}%`)
      query.orWhere('email', 'LIKE', `%${name}%`)
    }

    let users = await query.paginate(pagination.page, pagination.limit)
    users = await transform.paginate(users, UserTransformer)

    return users
  }

  /**
   * Create/save a new user.
   * POST users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response, transform }) {
    try {
      const userData = request.only([
        'name',
        'surname',
        'email',
        'password',
        'image_id'
      ])

      let user = User.create(userData)
      user = await transform.item(user, UserTransformer)

      return response.status(201).send(user)
    } catch(error) {
      console.log(error)
      return response.status(400).send({ message: 'Não foi possivel criar este usuario no momento' })
    }
  }

  /**
   * Display a single user.
   * GET users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params: { id }, transform, response }) {
    let user = await User.findOrFail(id)
    user = await transform.item(user, UserTransformer)

    return response.send(user)
  }

  /**
   * Update user details.
   * PUT or PATCH users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params: { id }, transform, response, request }) {
    let user = await User.findOrFail(id)
    const userData = request.only([
      'name',
      'surname',
      'email',
      'password',
      'image_id'
    ])

    user.merge(userData)
    await user.save()

    user = transform.item(user, UserTransformer)

    return user
  }

  /**
   * Delete a user with id.
   * DELETE users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params: { id }, request, response }) {
    const user = await User.findOrFail(id)

    try {
      await user.delete()
      return response.status(204).send()
    } catch(error) {
      return response.status(500).send({ message: 'Não foi possivel deletar este usuario' })
    }
  }
}

module.exports = UserController
