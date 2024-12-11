'use strict'

const AdminOrderShowSuite = use('Test/Suite')('Admin Orders -> SHOW')
const { test, trait } = AdminOrderShowSuite

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

AdminOrderShowSuite.timeout(0)

const { createAdmin, createOrder } = require('../../helpers')

trait('Test/ApiClient')
trait('Auth/Client')
trait('DatabaseTransactions')

test('it should show an order', async ({ assert, client }) => {
  const user = await createAdmin()
  const order = await createOrder(user)

  const response = await client
    .get('v1/admin/orders/' + order.id)
    .loginVia(user)
    .end()

  response.assertStatus(200)
  assert.property(response.body, 'id')
  assert.property(response.body, 'status')
  assert.property(response.body, 'date')
  assert.property(response.body, 'qty_items')
  assert.property(response.body, 'discount')
  assert.property(response.body, 'subtotal')
  assert.property(response.body, 'items')
  assert.property(response.body, 'address')
  assert.property(response.body.address, 'city')
})

test('it should return 401 when not authenticated', async ({ client }) => {
  const response = await client
    .get('v1/admin/orders/1')
    .end()

  response.assertStatus(401)
})

test('it should return 403 when user not a admin', async ({ client }) => {
  const user = await Factory
    .model('App/Models/User')
    .create()

  const response = await client
    .get('v1/admin/orders/1')
    .loginVia(user)
    .end()

  response.assertStatus(403)
})
