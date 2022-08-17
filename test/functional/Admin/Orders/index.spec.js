'use strict'

const AdminOrderIndexSuite = use('Test/Suite')('Admin Orders -> INDEX')
const { test, trait } = AdminOrderIndexSuite

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

AdminOrderIndexSuite.timeout(0)

const { createAdmin, createOrder } = require('../../helpers')

trait('Test/ApiClient')
trait('Auth/Client')
trait('DatabaseTransactions')

test('it should list orders', async ({ client }) => {
  const user = await createAdmin()
  const orders = await createOrder(user, 5)

  const response = await client
    .get('v1/admin/orders/')
    .loginVia(user)
    .end()

  response.assertStatus(200)
})

test('it should list orders with id filter', async ({ assert, client }) => {
  const user = await createAdmin()
  const orders = await createOrder(user, 5)

  const response = await client
    .get('v1/admin/orders/?id=1')
    .loginVia(user)
    .end()

  response.assertStatus(200)
  assert.equal(response.body.data.length, 1)
  assert.equal(response.body.data[0].id, 1)
})

test('it should list orders with status filter', async ({ assert, client }) => {
  const user = await createAdmin()
  const orders = await createOrder(user, 5)
  const ordersPaid = await createOrder(user, 2, 'paid')

  const response = await client
    .get('v1/admin/orders/?status=paid')
    .loginVia(user)
    .end()

  response.assertStatus(200)
  assert.equal(response.body.data.length, 2)
  assert.equal(response.body.data[0].status, 'paid')
})

test('it should return 401 when not authenticated', async ({ client }) => {
  const response = await client
    .get('v1/admin/orders/')
    .end()

  response.assertStatus(401)
})

test('it should return 403 when user not a admin', async ({ client }) => {
  const user = await Factory
    .model('App/Models/User')
    .create()

  const response = await client
    .get('v1/admin/orders/')
    .loginVia(user)
    .end()

  response.assertStatus(403)
})
