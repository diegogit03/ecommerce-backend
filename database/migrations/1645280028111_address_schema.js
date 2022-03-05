'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddressSchema extends Schema {
  up () {
    this.create('addresses', (table) => {
      table.increments()
      table.integer('city_id').unsigned().notNullable()
      table.integer('user_id').unsigned().notNullable()
      table.integer('number').notNullable()
      table.string('street', 255).notNullable()
      table.string('district', 255).notNullable()
      table.integer('cep').notNullable()
      table.timestamps()

      table
        .foreign('city_id')
        .references('id')
        .inTable('cities')

      table
        .foreign('user_id')
        .references('id')
        .inTable('users')
    })
  }

  down () {
    this.drop('addresses')
  }
}

module.exports = AddressSchema
