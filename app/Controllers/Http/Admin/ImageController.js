'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Drive = use('Drive')
const Helpers = use('Helpers')

const Image = use('App/Models/Image')
const { manage_single_upload, manage_multiple_uploads } = use('App/Helpers')
const ImageTransformer = use('App/Transformers/Admin/ImageTransformer')

/**
 * Resourceful controller for interacting with images
 */
class ImageController {
  /**
   * Show a list of all images.
   * GET images
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ pagination, transform }) {
    let images = await Image.query()
      .orderBy('id', 'DESC')
      .paginate(pagination.page, pagination.limit)

    images = await transform.paginate(images, ImageTransformer)

    return images
  }

  /**
   * Create/save a new image.
   * POST images
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response, transform }) {
    try {
      // captura uma imagem ou mais do request
      const fileJar = request.file('images', {
        types: ['image'],
        size: '2mb'
      })

      let images = []

      // caso seja um unico arquivo - manage_single_upload
      // caso seja vários arquivos - manage_multiple_upload
      if(!fileJar.files) {
        const file = await manage_single_upload(fileJar)
        if(file.fileJar.moved()) {
          const image = await Image.create({
            filename: file.fileJar.filename,
            size: file.fileJar.size,
            original_name: file.fileJar.clientName,
            extension: file.fileJar.subtype
          })

          const transformedImage = await transform.item(image, ImageTransformer)

          images.push(transformedImage)

          return response.status(201).send({ successes: images, errors: [] })
        }

        return response.status(400).send({
          message: 'Não foi possível processar está imagem no momento!'
        })
      }

      let files = await manage_multiple_uploads(fileJar)

      await Promise.all(files.successes.map(async file => {
        const image = await Image.create({
          filename: file.fileJar.filename,
          size: file.fileJar.size,
          original_name: file.fileJar.clientName,
          extension: file.fileJar.subtype
        })

        const transformedImage = await transform.item(image, ImageTransformer)

        images.push(transformedImage)
      }))

      return response.status(201).json({ successes: images, errors: files.errors })
    } catch(error) {
      console.log(error)
      return response.status(400).send({
        message: 'Não foi possivel processar sua solicitação'
      })
    }
  }

  /**
   * Display a single image.
   * GET images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async show ({ params: { id }, transform }) {
    let image = await Image.findOrFail(id)
    image = await transform.item(image, ImageTransformer)
    return image
  }

  /**
   * Update image details.
   * PUT or PATCH images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params: { id }, request, response, transform }) {
    let image = await Image.findOrFail(id)
    try {
      image.merge(request.only(['original_name']))
      await image.save()
      image = await transform.item(image, ImageTransformer)
      return image
    } catch(error) {
      return response.status(400).send({
        message: 'Não foi possivel atualizar essa imagem no momento'
      })
    }
  }

  /**
   * Delete a image with id.
   * DELETE images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params: { id }, request, response }) {
    const image = await Image.findOrFail(id)
    try {
      await Drive.delete(image.filename)
      await image.delete()

      return response.status(204).send()
    } catch(error) {
		console.log(error)
      return response.status(400).send({
        message: 'Não foi possivel deletar a imagem no momento'
      })
    }
  }
}

module.exports = ImageController
