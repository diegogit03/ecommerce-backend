'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Order = use('App/Models/Order')

/** @type {import('@adonisjs/lucid/src/Database')} */
const Database = use('App/Models/Database')

const Service = use('App/Services/Order/OrderService')

/**
 * Resourceful controller for interacting with orders
 */
class OrderController {
  /**
   * Show a list of all orders.
   * GET orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Object} ctx.pagination
   */
  async index ({ request, response, pagination }) {
    const { status, id } = request.only(['status', 'id'])
    const query = Order.query()

    if(status && id) {
      query.where('status', status)
      query.orWhere('id', 'LIKE', `%${id}%`)
    } else if(status) {
      query.where('status', status)
    } else if(id) {
      query.orWhere('id', 'LIKE', `%${id}%`)
    }

    const orders = query.paginate(pagination.page, pagination.limit)
    return response.json(orders)
  }

  /**
   * Create/save a new order.
   * POST orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
    const trx = await Database.beginTransaction()

    try {
      const { user_id, items, status } = request.all()

      let order = await Order.create({ user_id, status }, trx)
      const service = new Service(order, trx)

      if(items && items.length > 0)
        await service.syncItems(items);

      await trx.commit()

      return response.status(201).json(order)
    } catch(error) {
      await trx.rollback()
      return response.status(400).json({
        message: 'Não foi possivel criar o pedido no momento!'
      })
    }
  }

  /**
   * Display a single order.
   * GET orders/:id
   *
   * @param {object} ctx
   * @param {Response} ctx.response
   */
  async show ({ params: { id }, response }) {
    const order = await Order.findOrFail(id)
    return response.json(order)
  }

  /**
   * Update order details.
   * PUT or PATCH orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
  }

  /**
   * Delete a order with id.
   * DELETE orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params: { id }, request, response }) {
    const order = await Order.findOrFail(id)
    const trx = await Database.beginTransaction()
    try {
      await order.items().delete(trx)
      await order.coupons().delete()
      await order.delete()
      await trx.commit()
      return response.status(204).send()
    } catch (error) {
      return response.status(400).json({
        message: 'Erro ao deletar este pedido!'
      })
    }
  }
}

module.exports = OrderController
