'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Coupon = use('App/Models/Coupon')
const Database = use('Database')

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
  async index ({ request, pagination }) {
    const code = request.input('code')
    const query = await Coupon.query()

    if(code) {
      query.where('code', 'LIKE', `%${code}%`)
    }

    const coupons = await query.paginate(pagination.page, pagination.limit)
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
  async store ({ request, response }) {
  }

  /**
   * Display a single coupon.
   * GET coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async show ({ params: { id } }) {
    const coupon = await Coupon.findOrFail(id)
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
  async update ({ params, request, response }) {
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
    const trx = Database.beginTransaction()
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
