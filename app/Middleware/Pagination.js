'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class Pagination {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle (ctx, next) {
    // call next to advance the request
    if (ctx.request.method() === 'GET') {
      const pageInput = parseInt(ctx.request.input('page'))
      const limitInput = parseInt(ctx.request.input('limit'))
      const page = pageInput ? pageInput : 1
      const limit = limitInput ? limitInput : 20

      ctx.pagination = {
        page,
        limit
      }

      const perpageInput = parseInt(ctx.request.input('perpage'))
      const perpage = perpageInput ? perpageInput : 20
      if (perpage) {
        ctx.pagination.limit = perpage
      }
    }

    await next()
  }
}

module.exports = Pagination
