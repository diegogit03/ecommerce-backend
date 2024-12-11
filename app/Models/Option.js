'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Option extends Model {

  image () {
    return this.belongsTo('App/Models/Image')
  }

  selection () {
    return this.belongsTo('App/Models/Selection')
  }

}

module.exports = Option
