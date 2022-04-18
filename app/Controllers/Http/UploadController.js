'use strict'

const Drive = use('Drive')
const fs = use('fs')
const path = use('path')
const Image = use('App/Models/Image')

class UploadController {
  async show ({ params: { name }, response }) {
    const image = await Image.findByOrFail('filename', name)
    response.header('Content-type', `image/${image.extension}`)

    if (Drive._config.default === 's3') {
      const imageObj = await Drive.getObject(image.filename)

      return imageObj.Body
    } else {
      const imageFile = await Drive.get(image.filename)

      return imageFile
    }
  }
}

module.exports = UploadController
