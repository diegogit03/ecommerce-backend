'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SpecificationsSchema extends Schema {
  up () {
    this.create('specifications', (table) => {
      table.increments()
      table.integer('item_id').unsigned().notNullable()
      table.integer('selection_id').unsigned().notNullable()
      table.integer('option_id').unsigned().notNullable()

      table
        .foreign('item_id')
        .references('id')
        .inTable('order_items')
        .onDelete('CASCADE')

      table
        .foreign('selection_id')
        .references('id')
        .inTable('selections')
        .onDelete('CASCADE')

      table
        .foreign('option_id')
        .references('id')
        .inTable('options')
    })
  }

  down () {
    this.drop('specifications')
  }
}

module.exports = SpecificationsSchema
