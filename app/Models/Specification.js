'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Specification extends Model {

  item () {
    return this.belongsTo('App/Models/OrderItem', 'item_id', 'id')
  }

  static get traits(){
    return ['App/Models/Traits/NoTimestamp']
  }

  selection () {
    return this.belongsTo('App/Models/Selection')
  }

  option () {
    return this.belongsTo('App/Models/Option')
  }

}

module.exports = Specification
