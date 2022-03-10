'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const MercadoPago = require('mercadopago')
const { uuid } = require('uuidv4')

const Database = use('Database')
const Ws = use('Ws')
const Env = use('Env')

const Order = use('App/Models/Order')
const Product = use('App/Models/Product')
const Coupon = use('App/Models/Coupon')
const Discount = use('App/Models/Discount')
const OrderTransformer = use('App/Transformers/Admin/OrderTransformer')
const Service = use('App/Services/Order/OrderService')

MercadoPago.configure({
  sandbox: Env.get('MP_ENV') === 'production' ? false : true,
  access_token: Env.get('MP_ACCESS_TOKEN')
})

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
   * @param {View} ctx.view
   */
  async index ({ request, auth, transform, pagination }) {
    const client = await auth.getUser()
    const number = request.input('number')
    const query = Order.query()

    if (number) {
      query.where('id', 'LIKE', `%${number}%`)
    }

    query.where('user_id', client.id)

    const results = await query
      .orderBy('id', 'DESC')
      .paginate(pagination.page, pagination.limit)

    const orders = await transform.paginate(results, OrderTransformer)

    return orders
  }

  /**
   * Create/save a new order.
   * POST orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response, auth, transform }) {
    const { address_id } = request.all()
    const trx = await Database.beginTransaction()
    const idToPay = '' + uuid()

    try {
      const items = request.input('items')
      const client = await auth.getUser()

      var order = await Order.create({ user_id: client.id, address_id, pay_id: idToPay }, trx)

      const service = new Service(order, trx)

      if (items.length > 0) {
        await service.syncItems(items)
      }

      order = await Order.find(order.id)
      order = await transform.include('items').item(order, OrderTransformer)

      const topic = Ws.getChannel('notifications').topic('notifications')

      if (topic) {
        topic.broadcast('new:order', order)
      }

      const products = (await Product.all()).toJSON()

      const itemsToMercadoPago = items.map(item => {
        const product = products.find(product => product.id == item.product_id)

        return {
          id: idToPay,
          description: 'Um Produto na Dog Pets',
          quantity: item.quantity,
          currency_id: 'BRL',
          unit_price: parseFloat(product.price)
        }
      })

      const payment = await MercadoPago.preferences.create({
        items: [...itemsToMercadoPago],
        payer: {email: client.email},
        external_reference: idToPay
      })

      await trx.commit()

      return response.status(201).send({
        ...order,
        pay_url: payment.body.init_point
      })
    } catch (error) {
      console.log(error)
      await trx.rollback()
      return response.status(400).send({
        message: 'Não foi possivel fazer seu pedido!'
      })
    }
  }

  /**
   * Display a single order.
   * GET orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params: { id }, auth, transform }) {
    const client = await auth.getUser()
    const result = await Order.query()
      .where('user_id', client.id)
      .where('id', id)
      .first()
    const order = await transform.item(result, OrderTransformer)

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
  async update ({ params: { id }, request, response, auth, transform }) {
    const client = await auth.getUser()
    var order = await Order.query()
      .where('user_id', client.id)
      .where('id', id)
      .firstOrFail()

    const trx = await Database.beginTransaction()

    try {
      const { items, status } = request.all()
      order.merge({ user_id: client.id, status })
      const service = new Service(order, trx)

      await service.updateItems(items)
      await order.save()
      await trx.commit()

      order = await transform.include('items,coupons,discounts').item(order, OrderTransformer)
      return order
    } catch (error) {
      await trx.rollback()
      return response.status(400).send({
        message: 'Não foi possível atualizar seu pedido!'
      })
    }
  }

  async applyDiscount ({ params: { id }, request, response, transform, auth }) {
    const { code } = request.all()

    const coupon = await Coupon.findByOrFail('code', code.toUpperCase())
    const client = await auth.getUser()
    const order = await Order.query()
      .where('user_id', client.id)
      .where('id', id)
      .firstOrFail()

    var discount, info = {}

    try {
      const service = new Service(order)
      const canAddDiscount = await service.canApplyDiscount(coupon)
      const orderDiscounts = await order.coupons().getCount()

      const canApplyToOrder = orderDiscounts < 1 || (orderDiscounts >= 1 && coupon.recursive)

      if (canAddDiscount && canApplyToOrder) {
        discount = await Discount.findOrCreate({
          order_id: order.id,
          coupon_id: coupon.id
        })

        info.message = 'Cupom aplicado com sucesso!'
        info.success = true
      } else {
        info.message = 'Não foi possível aplicar o cupom!'
        info.success = true
      }

      order = await transform.include('coupons,items,discounts').item(order, OrderTransformer)
      return { order, info }
    } catch (error) {
      return response.status(400).send({
        message: 'Erro desconhecido!'
      })
    }
  }

  async removeDiscount ({ params: { id }, request, response, transform, auth }) {
    const { discount_id } = request.all()
    const discount = await Discount.findOrFail(discount_id)
    await discount.delete()
    return response.status(204).send()
  }
}

module.exports = OrderController
