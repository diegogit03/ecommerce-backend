'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */

const Product = use('App/Models/Product')
const ProductTransformer = use('App/Transformers/Admin/ProductTransformer')

/**
 * Resourceful controller for interacting with products
 */
class ProductController {
  /**
   * Show a list of all products.
   * GET products
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async index ({ request, pagination, transform }) {
    const { title } = request.input('title')

    const query = Product.query()

    if (title) {
      query.where('name', 'LIKE', `${title}`)
    }

    const results = await query.paginate(pagination.page, pagination.limit)
    const products = await transform.paginate(results, ProductTransformer)

    return products
  }

  /**
   * Display a single product.
   * GET products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async show ({ params: { id }, transform }) {
    const result = await Product.findOrFail(id)
    const product = await transform.item(result, ProductTransformer)

    return product
  }
}

module.exports = ProductController
