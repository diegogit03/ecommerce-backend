'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SelectionsSchema extends Schema {
  up () {
    this.create('selections', (table) => {
      table.increments()

      table.string('description', 255).notNullable()
      table.integer('product_id').unsigned().notNullable()

      table
        .foreign('product_id')
        .references('id')
        .inTable('products')

      table.timestamps()
    })
  }

  down () {
    this.drop('selections')
  }
}

module.exports = SelectionsSchema
