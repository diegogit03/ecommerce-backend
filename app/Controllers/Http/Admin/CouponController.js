'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Coupon = use('App/Models/Coupon')
const Database = use('Database')

const Service = use('App/Services/Coupon/CouponService')

const CouponTransformer = use('App/Transformers/Admin/CouponTransformer')

/**
 * Resourceful controller for interacting with coupons
 */
class CouponController {
  /**
   * Show a list of all coupons.
   * GET coupons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {object} ctx.pagination
   */
  async index ({ request, pagination, transform }) {
    const code = request.input('code')
    const query = Coupon.query()

    if (code) {
      query.where('code', 'LIKE', `%${code}%`)
    }

    let coupons = await query.paginate(pagination.page, pagination.limit)
    coupons = await transform.paginate(coupons, CouponTransformer)

    return coupons
  }

  /**
   * Create/save a new coupon.
   * POST coupons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response, transform }) {
    const trx = await Database.beginTransaction()

    let can_use_for = {
      client: false,
      product: false
    }

    try {
      const couponData = request.only([
        'code',
        'discount',
        'valid_from',
        'valid_until',
        'quantity',
        'type',
        'recursive'
      ])

      const { users, products } = request.only(['users', 'products'])
      let coupon = await Coupon.create(couponData, trx)

      const service = new Service(coupon, trx)

      if(users && users.length > 0) {
        await service.syncUsers(users)
        can_use_for.client = true
      }

      if(products && products.length > 0) {
        await service.syncProducts(products)
        can_use_for.product = true
      }

      if(can_use_for.product && can_use_for.client) {
        coupon.can_use_for = 'product_client'
      } else if(can_use_for.product && !can_use_for.client) {
        coupon.can_use_for = 'product'
      } else if(can_use_for.client && !can_use_for.product) {
        coupon.can_use_for = 'client'
      } else {
        coupon.can_use_for = 'all'
      }

      await coupon.save(trx)
      await trx.commit()

      coupon = await transform.include('users,products').item(coupon, CouponTransformer)

      return response.status(201).json(coupon)
    } catch(error) {
      await trx.rollback()
      return response.status(400).json({
        message: 'Não foi possivel criar o cupom no momento'
      })
    }
  }

  /**
   * Display a single coupon.
   * GET coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async show ({ params: { id }, transform }) {
    let coupon = await Coupon.findOrFail(id)
    coupon = await transform.include('users,products,orders').item(coupon, CouponTransformer)

    return coupon
  }

  /**
   * Update coupon details.
   * PUT or PATCH coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params: { id }, request, response, transform }) {
    const trx = Database.beginTransaction()
    let coupon = await Coupon.findOrFail(id)

    let can_use_for = {
      client: false,
      product: false
    }

    try {
      const couponData = request.only([
        'code',
        'discount',
        'valid_from',
        'valid_until',
        'quantity',
        'type',
        'recursive'
      ])

      coupon.merge(couponData)

      await coupon.save(trx)

      const { users, products } = request.only(['users', 'products'])

      const service = new Service(coupon, trx)

      if(users && users.length > 0) {
        await service.syncUsers(users)
        can_use_for.client = true
      }

      if(products && products.length > 0) {
        can_use_for.client = true
      }

      if(can_use_for.product && can_use_for.client) {
        coupon.can_use_for = 'product_client'
      } else if(can_use_for.product && !can_use_for.client) {
        coupon.can_use_for = 'product'
      } else if(can_use_for.client && !can_use_for.product) {
        coupon.can_use_for = 'client'
      } else {
        coupon.can_use_for = 'all'
      }

      await coupon.save(trx)
      await trx.commit()

      coupon = await transform.item(coupon, CouponTransformer)

      return response.json(coupon)
    } catch(error) {
      await trx.rollback()
      return response.status(400).json({
        message: 'Não foi possivel atualizar este cupom no momento'
      })
    }
  }

  /**
   * Delete a coupon with id.
   * DELETE coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params: { id }, request, response }) {
    const trx = await Database.beginTransaction()
    const coupon = await Coupon.findOrFail(id)
    try {
      await coupon.products().detach([], trx)
      await coupon.orders().detach([], trx)
      await coupon.users().detach([], trx)
      await coupon.delete(trx)
      await trx.commit()
      return response.status(204).send()
    } catch(error) {
      await trx.rollback()
      return response.status(400).message({
        message: 'Não foi possivel deletar este cupom no momento!'
      })
    }
  }
}

module.exports = CouponController
