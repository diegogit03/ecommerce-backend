'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Selection extends Model {

  product () {
    return this.belongsTo('App/Models/Product')
  }

  options () {
    return this.hasMany('App/Models/Option')
  }

}

module.exports = Selection
