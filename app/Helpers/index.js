'use strict'

const fs = require('fs');

const crypto = use('crypto')
const Helpers = use('Helpers')
const Drive = use('Drive')

/**
 * Generate random string
 *
 * @param { int } length - O tamanho da string que você quer gerar
 * @return { string } - uma string randomica do tamanho do length
 */
const str_random = async (length = 40) => {
  let string = ''
  let len = string.length

  if(len < length) {
    let size = length - len
    let bytes = await crypto.randomBytes(size)
    let buffer = Buffer.from(bytes)
    string += buffer
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substr(0, size)
  }

  return string
}

/**
 * Move um unico arquivo
 * @param { FileJar } file - o arquivo a ser gerenciado
 * @return { Object<FileJar> }
 */
const manage_single_upload = async (file) => {
  // gera um nome aleatorio
  const random_name = await str_random(30)
  let filename = `${new Date().getTime()}-${random_name}.${file.subtype}`

  const content = fs.readFileSync(file.tmpPath)
  const fileUrl = await Drive.put(filename, content, {
    visibility: 'public',
    contentType: `${file.type}/${file.subtype}`
  })

  file.filename = filename
  file.status = 'moved'

  return { fileJar: file, url: fileUrl }
}

/**
 * Move multiplos arquivos para o caminho especificado
 * @param { FileJar } fileJar
 * @return { Object }
 */
const manage_multiple_uploads = async (fileJar) => {
  let successes = [],
    errors = []

  await Promise.all(fileJar.files.map(async file => {
    const upload = await manage_single_upload(file)

    // verificamos se moveu mesmo
    if(upload.fileJar.moved()) {
      successes.push(upload)
    } else {
      errors.push(upload.error())
    }
  }))

  return { successes, errors }
}

module.exports = {
  str_random,
  manage_single_upload,
  manage_multiple_uploads
}
