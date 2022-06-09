'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class OrderSchema extends Schema {
  up () {
    this.table('orders', (table) => {
      table.integer('address_id').unsigned()

      table
        .foreign('address_id')
        .references('id')
        .inTable('addresses')
        .onDelete('cascade')
    })
  }

  down () {
    this.table('orders', (table) => {
      table.dropForeign('address_id')
    })
  }
}

module.exports = OrderSchema
