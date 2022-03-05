'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CitySchema extends Schema {
  up () {
    this.create('cities', (table) => {
      table.increments()
      table.string('name', 255).notNullable()
      table.integer('state_id').unsigned().notNullable()
      table.timestamps()

      table
        .foreign('state_id')
        .references('id')
        .inTable('states')
    })
  }

  down () {
    this.drop('cities')
  }
}

module.exports = CitySchema
