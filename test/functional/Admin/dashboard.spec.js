'use strict'

const AdminDashSuite = use('Test/Suite')('Admin Dashboard')
const { test, trait } = AdminDashSuite

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

const { createAdmin } = require('../helpers')

AdminDashSuite.timeout(0)

trait('Test/ApiClient')
trait('Auth/Client')
trait('DatabaseTransactions')

test('it should return dashboard info', async ({ assert, client }) => {
  const admin = await createAdmin()

  const orders = await Factory
    .model('App/Models/Order')
    .createMany(20)

  const products = await Factory
    .model('App/Models/Product')
    .createMany(20)

  const response = await client
    .get('v1/admin/dashboard')
    .loginVia(admin)
    .end()

  response.assertStatus(200)
  assert.equal(response.body.orders, orders.length)
  assert.equal(response.body.products, products.length)
  assert.equal(response.body.users, 1)
})
