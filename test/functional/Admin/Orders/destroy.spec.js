'use strict'

const AdminOrderDestroySuite = use('Test/Suite')('Admin Orders -> DESTROY')
const { test, trait } = AdminOrderDestroySuite

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

const Order = use('App/Models/Order')

AdminOrderDestroySuite.timeout(0)

const { createAdmin, createOrder } = require('../../helpers')

trait('Test/ApiClient')
trait('Auth/Client')
trait('DatabaseTransactions')

test('it should delete an order', async ({ assert, client }) => {
  const user = await createAdmin()
  let order = await createOrder(user)

  const response = await client
    .delete('v1/admin/orders/' + order.id)
    .loginVia(user)
    .end()

  response.assertStatus(204)
  order = await Order.find(order.id)
  assert.isNull(order)
})

test('it should return 401 when not authenticated', async ({ client }) => {
  const response = await client
    .delete('v1/admin/orders/1')
    .end()

  response.assertStatus(401)
})

test('it should return 403 when user not a admin', async ({ client }) => {
  const user = await Factory
    .model('App/Models/User')
    .create()

  const response = await client
    .delete('v1/admin/orders/1')
    .loginVia(user)
    .end()

  response.assertStatus(403)
})
