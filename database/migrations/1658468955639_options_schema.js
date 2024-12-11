'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class OptionsSchema extends Schema {
  up () {
    this.create('options', (table) => {
      table.increments()

      table.string('description', 255).notNullable()
      table.decimal('additional', 12, 2).notNullable()
      table.integer('image_id').unsigned()
      table.integer('selection_id').unsigned().notNullable()

      table
        .foreign('image_id')
        .references('id')
        .inTable('images')

      table
        .foreign('selection_id')
        .references('id')
        .inTable('selections')
        .onDelete('CASCADE')

      table.timestamps()
    })
  }

  down () {
    this.drop('options')
  }
}

module.exports = OptionsSchema
