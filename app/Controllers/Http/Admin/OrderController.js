'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const { getTransaction } = use('App/Helpers/database')

const Order = use('App/Models/Order')
const Coupon = use('App/Models/Coupon')
const Discount = use('App/Models/Discount')

/** @type {import('@adonisjs/lucid/src/Database')} */
const Database = use('Database')

const Service = use('App/Services/Order/OrderService')
const OrderTransformer = use('App/Transformers/Admin/OrderTransformer')

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
  async index ({ request, response, pagination, transform }) {
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

    let orders = await query.paginate(pagination.page, pagination.limit)
    orders = await transform.paginate(orders, OrderTransformer)

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
  async store ({ request, response, transform }) {
    const trx = await getTransaction()

    try {
      const { user_id, address_id, items, status } = request.all()

      let order = await Order.create({ user_id, status, address_id }, trx)
      const service = new Service(order, trx)

      if(items && items.length > 0)
        await service.syncItems(items);

      await trx.commit()

      order = await Order.find(order.id)
      await order.load('address.city')

      order = await transform.include('user,items,address.city').item(order, OrderTransformer)

      return response.status(201).json(order)
    } catch(error) {

      console.log(error)
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
  async show ({ params: { id }, response, transform }) {
    let order = await Order.findOrFail(id)
    order = await transform
      .include('user,items,discounts,address.city')
      .item(order, OrderTransformer)

    return order
  }

  /**
   * Update order details.
   * PUT or PATCH orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params: { id }, request, response, transform }) {
    let order = await Order.findOrFail(id)
    const trx = await getTransaction()

    try {
      const { user_id, items, status, address_id } = request.all()
      const service = new Service(order, trx)

      order.merge({ user_id, status, address_id })

      await service.updateItems(items)
      await order.save()
      await trx.commit()

      order = await transform.include('user,items,discounts,coupons,address.city').item(order, OrderTransformer)

      return order
    } catch (error) {
      console.log(error)
      await trx.rollback()
      return response.status(400).json({
        message: 'Não foi possivel atualizar este pedido no momento!'
      })
    }
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
    const trx = await getTransaction()

    try {
      await order.items().delete(trx)
      await order.coupons().delete(trx)
      await order.delete(trx)
      await trx.commit()
      return response.status(204).send()
    } catch (error) {
      return response.status(400).json({
        message: 'Erro ao deletar este pedido!'
      })
    }
  }

  async applyDiscount ({ params: { id }, request, response, transform }) {
    const { code } = request.all()
    const coupon = await Coupon.findByOrFail('code', code.toUpperCase())
    let order = await Order.findOrFail(id)
    var discount,
      info = {}

    try {
      const service = new Service(order)

      const canAddDiscount = await service.canApplyDiscount(coupon)
      const orderDiscounts = await order.coupons().getCount()
      const canApplyToOrder = orderDiscounts < 1 || (orderDiscounts >= 1 && coupon.recursive)

      if (canApplyToOrder && canAddDiscount) {
        discount = await Discount.findOrCreate(
          {
            order_id: order.id,
            coupon_id: coupon.id
          }
        )

        info.message = 'Cupom aplicado com sucesso'
        info.success = true
      } else {
        info.message = 'Não foi possível aplicar este cupom!'
        info.success = false
      }

      order = await transform.include('user,items,discounts,coupons').item(order, OrderTransformer)

      return { order, info }
    } catch (error) {
      return response.status(400).json({ message: 'Erro ao aplicar cupom!' })
    }
  }

  async removeDiscount ({ params: { id }, request, response }) {
    const { discount_id } = request.all()
    const discount = await Discount.findOrFail(discount_id)
    await discount.delete()
    return response.status(204).send()
  }

}

module.exports = OrderController
