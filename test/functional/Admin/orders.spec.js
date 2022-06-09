'use strict'

const AdminOrderSuite = use('Test/Suite')('Admin Orders')
const { test, trait } = AdminOrderSuite

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

const Order = use('App/Models/Order')

AdminOrderSuite.timeout(0)

const { createAdmin, createOrder } = require('../helpers')

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

test('it should store an order', async ({ assert, client }) => {
  const user = await createAdmin()

  const product = await Factory.model('App/Models/Product').create()

  const { id: state_id } = await Factory.model('App/Models/State').create()
  const { id: city_id } = await Factory.model('App/Models/City').create({ state_id })
  const address = await Factory.model('App/Models/Address').create({ city_id, user_id: user.id })

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
    .post('v1/admin/orders')
    .send(payload)
    .loginVia(user)
    .end()

  response.assertStatus(201)
  const order = await Order.find(response.body.id)
  assert.isNotNull(order)
  assert.equal(order.address_id, payload.address_id)
  assert.equal(order.user_id, payload.user_id)
  assert.equal(order.status, payload.status)
})

test('it should return 401 when not authenticated', async ({ client }) => {
  const response = await client
    .post('v1/admin/orders')
    .end()

  response.assertStatus(401)
})

test('it should return 403 when user not a admin', async ({ client }) => {
  const user = await Factory
    .model('App/Models/User')
    .create()

  const response = await client
    .post('v1/admin/orders')
    .loginVia(user)
    .end()

  response.assertStatus(403)
})

test('it should return 400 when address not exists', async ({ assert, client }) => {
  const user = await createAdmin()

  const payload = {
    address_id: Math.random() * 40
  }

  const response = await client
    .post('v1/admin/orders')
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

  const payload = {
    items: [
      {}
    ]
  }

  const response = await client
    .post('v1/admin/orders')
    .send(payload)
    .loginVia(user)
    .end()

  response.assertStatus(400)
  assert.property(response.body, 'errors')
  assert.equal(response.body.errors.length, 1)
  assert.equal(response.body.errors[0].validation, 'required')
  assert.equal(response.body.errors[0].field, 'items.0.product_id')
})

test('it should return 400 when product_id in a item not exists', async ({ assert, client }) => {
  const user = await createAdmin()

  const payload = {
    items: [
      {
        product_id: Math.random() * 40
      }
    ]
  }

  const response = await client
    .post('v1/admin/orders')
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
  const product = await Factory.model('App/Models/Product').create()

  const payload = {
    items: [
      {
        product_id: product.id,
        quantity: 0
      }
    ]
  }

  const response = await client
    .post('v1/admin/orders')
    .send(payload)
    .loginVia(user)
    .end()

  response.assertStatus(400)
  assert.property(response.body, 'errors')
  assert.equal(response.body.errors.length, 1)
  assert.equal(response.body.errors[0].validation, 'above')
  assert.equal(response.body.errors[0].field, 'items.0.quantity')
})

test('it should update an order', async ({ assert, client }) => {
  const admin = await createAdmin()
  const user = await Factory
    .model('App/Models/User')
    .create()
  const order = await createOrder(admin)

  const product = await Factory.model('App/Models/Product').create()

  const { id: state_id } = await Factory.model('App/Models/State').create()
  const { id: city_id } = await Factory.model('App/Models/City').create({ state_id })
  const address = await Factory.model('App/Models/Address').create({ city_id, user_id: user.id })

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
  assert.equal(response.body.errors[0].field, 'items.0.product_id')
})

test('it should return 400 when product_id in a item not exists', async ({ assert, client }) => {
  const user = await createAdmin()
  const order = await createOrder(user)

  const payload = {
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

  const payload = {
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
