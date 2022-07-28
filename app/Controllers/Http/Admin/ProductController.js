'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Product = use('App/Models/Product')
const { getTransaction } = use('App/Helpers/database')

const createSelections = async (selections, product, trx) => {
  const selectionsPromises = selections.map(({ description, options }) => new Promise((resolve, reject) => {
    product.selections().create({ description }, trx)
      .then(selection => selection.options().createMany(options, trx))
      .then(selection => resolve(selection))
      .catch(error => reject(error))
  }))

  await Promise.all(selectionsPromises)
}

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
   * @param {View} ctx.view
   */
  async index ({ request, response, pagination, transform }) {
    const name = request.input('name')
    const query = Product.query()

    if (name) {
      query.where('name', 'LIKE', `%${name}%`)
    }

    let products = await query.paginate(pagination.page, pagination.limit)
    products = await transform.paginate(products, ProductTransformer)

    return response.send(products)
  }

  /**
   * Create/save a new product.
   * POST products
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response, transform }) {
    const trx = await getTransaction()

    try {
      const { name, description, price, image_id, selections } = request.all()

      let product = await Product.create({
        name,
        description,
        price,
        image_id
      })

      await createSelections(selections, product, trx)

      await trx.commit()

      product = await transform.item(product, ProductTransformer)

      return response.status(201).send(product)
    } catch(error) {
      await trx.rollback()
      response.status(400).send({ message: 'Não foi possivel criar o produto neste momento' })
    }
  }

  /**
   * GET products/:id
   *
   * @param {object} ctx
   * Display a single product.
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params: { id }, transform, response }) {
    let product = await Product.findOrFail(id)
    product = await transform.item(product, ProductTransformer)

    return response.send(product)
  }

  /**
   * Update product details.
   * PUT or PATCH products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params: { id }, request, response, transform }) {
    let product = await Product.findOrFail(id)
    const trx = await getTransaction()

    try {
      const { name, description, price, image_id, selections } = request.all()
      product.merge({ name, description, price, image_id })

      await product.selections().delete(trx)
      await createSelections(selections, product, trx)

      await product.save(trx)
      await trx.commit()

      product = await transform.item(product, ProductTransformer)

      return product
    } catch(error) {

      console.log(error)
      await trx.rollback()
      return response.status(400).send({ message: 'Não foi possivel atualizar este produto!' })

    }
  }

  /**
   * Delete a product with id.
   * DELETE products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params: { id }, request, response }) {
    const product = await Product.findOrFail(id)

    try {
      await product.delete()
      return response.status(204).send()
    } catch(error) {
      return response.status(500).send({ message: 'Não foi possivel deletar o produto!' })
    }
  }
}

module.exports = ProductController
