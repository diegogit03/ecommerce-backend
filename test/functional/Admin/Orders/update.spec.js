'use strict'

const AdminOrderUpdateSuite = use('Test/Suite')('Admin Orders -> UPDATE')
const { test, trait } = AdminOrderUpdateSuite

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

AdminOrderUpdateSuite.timeout(0)

const { createAdmin, createOrder, createAddress } = require('../../helpers')

trait('Test/ApiClient')
trait('Auth/Client')
trait('DatabaseTransactions')

test('it should update an order', async ({ assert, client }) => {
  const admin = await createAdmin()
  const user = await Factory
    .model('App/Models/User')
    .create()
  const order = await createOrder(admin)

  const product = await Factory.model('App/Models/Product').create()

  const address = await createAddress(user)

  const payload = {
    user_id: user.id,
    address_id: address.id,
    status: 'paid',
    items: [
      {
        product_id: product.id,
        quantity: 4
      }
    ]
  }

  const response = await client
    .put('v1/admin/orders/' + order.id)
    .send(payload)
    .loginVia(admin)
    .end()

  response.assertStatus(200)
  await order.reload()
  assert.equal(order.address_id, payload.address_id)
  assert.equal(order.user_id, payload.user_id)
  assert.equal(order.status, payload.status)
})

test('it should return 401 when not authenticated', async ({ client }) => {
  const response = await client
    .put('v1/admin/orders/1')
    .end()

  response.assertStatus(401)
})

test('it should return 403 when user not a admin', async ({ client }) => {
  const user = await Factory
    .model('App/Models/User')
    .create()

  const response = await client
    .put('v1/admin/orders/1')
    .loginVia(user)
    .end()

  response.assertStatus(403)
})

test('it should return 400 when address not exists', async ({ assert, client }) => {
  const user = await createAdmin()
  const order = await createOrder(user)

  const payload = {
    address_id: Math.random() * 40
  }

  const response = await client
    .put('v1/admin/orders/' + order.id)
    .send(payload)
    .loginVia(user)
    .end()

  response.assertStatus(400)
  assert.property(response.body, 'errors')
  assert.equal(response.body.errors.length, 1)
  assert.equal(response.body.errors[0].validation, 'exists')
  assert.equal(response.body.errors[0].field, 'address_id')
})

test('it should return 400 when required data is not provided', async ({ assert, client }) => {
  const user = await createAdmin()
  const order = await createOrder(user)

  const payload = {
    items: [
      {}
    ]
  }

  const response = await client
    .put('v1/admin/orders/' + order.id)
    .send(payload)
    .loginVia(user)
    .end()

  response.assertStatus(400)
  assert.property(response.body, 'errors')
  assert.equal(response.body.errors.length, 1)
  assert.equal(response.body.errors[0].validation, 'required')
})

test('it should return 400 when product_id in a item not exists', async ({ assert, client }) => {
  const user = await createAdmin()
  const order = await createOrder(user)

  const address = await createAddress(user)

  const payload = {
    address_id: address.id,
    items: [
      {
        product_id: Math.random() * 40
      }
    ]
  }

  const response = await client
    .put('v1/admin/orders/' + order.id)
    .send(payload)
    .loginVia(user)
    .end()

  response.assertStatus(400)
  assert.property(response.body, 'errors')
  assert.equal(response.body.errors.length, 1)
  assert.equal(response.body.errors[0].validation, 'exists')
  assert.equal(response.body.errors[0].field, 'items.0.product_id')
})

test('it should return 400 when quantity in a item is less than 1', async ({ assert, client }) => {
  const user = await createAdmin()
  const order = await createOrder(user)
  const product = await Factory.model('App/Models/Product').create()

  const address = await createAddress(user)

  const payload = {
    address_id: address.id,
    items: [
      {
        product_id: product.id,
        quantity: 0
      }
    ]
  }

  const response = await client
    .put('v1/admin/orders/' + order.id)
    .send(payload)
    .loginVia(user)
    .end()

  response.assertStatus(400)
  assert.property(response.body, 'errors')
  assert.equal(response.body.errors.length, 1)
  assert.equal(response.body.errors[0].validation, 'above')
  assert.equal(response.body.errors[0].field, 'items.0.quantity')
})
