'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Product extends Model {

  image () {
    return this.belongsTo('App/Models/Image')
  }

  categories () {
    return this.belongsToMany('App/Models/Category')
  }

  coupons () {
    return this.belongsToMany('App/Models/Coupon')
  }

  selections () {
    return this.hasMany('App/Models/Selection')
  }

}

module.exports = Product
