'use strict'

const ClientOrderSuite = use('Test/Suite')('Client Order')
const { test, trait } = ClientOrderSuite

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

const Order = use('App/Models/Order')

ClientOrderSuite.timeout(0)

const { createOrder, createAdmin } = require('../helpers')

trait('Test/ApiClient')
trait('Auth/Client')
trait('DatabaseTransactions')

test('it should show an order', async ({ assert, client }) => {
  const user = await Factory
    .model('App/Models/User')
    .create()
  const order = await createOrder(user)

  const response = await client
    .get('v1/orders/' + order.id)
    .loginVia(user)
    .end()

  response.assertStatus(200)
  assert.property(response.body, 'items')
  assert.property(response.body, 'address')
  assert.property(response.body.address, 'city')
})

test('it should return 401 when not authenticated', async ({ client }) => {
  const response = await client
    .get('v1/orders/1')
    .end()

  response.assertStatus(401)
})

test('it should list all orders of authenticated user', async ({ client, assert }) => {
  const admin = await createAdmin()
  const user = await Factory
    .model('App/Models/User')
    .create()


  const orderOfAdmin = await createOrder(admin)
  const orderOfUser = await createOrder(user, 5)

  const response = await client
    .get('v1/orders/')
    .loginVia(user)
    .end()

  response.assertStatus(200)
  assert.notInclude(response.body.data.map(order => order.id), orderOfAdmin.id)
})

test('it should return 401 when not authenticated', async ({ client }) => {
  const response = await client
    .get('v1/orders/')
    .end()

  response.assertStatus(401)
})

test('it should store an order', async ({ assert, client }) => {
  const user = await Factory
    .model('App/Models/User')
    .create()

  const product = await Factory.model('App/Models/Product').create()

  const { id: state_id } = await Factory.model('App/Models/State').create()
  const { id: city_id } = await Factory.model('App/Models/City').create({ state_id })
  const address = await Factory.model('App/Models/Address').create({ city_id, user_id: user.id })

  const payload = {
    user_id: user.id,
    address_id: address.id,
    items: [
      {
        product_id: product.id,
        quantity: 4
      }
    ]
  }

  const response = await client
    .post('v1/orders')
    .send(payload)
    .loginVia(user)
    .end()

  response.assertStatus(201)
  const order = await Order.find(response.body.id)
  assert.isNotNull(order)
  assert.property(response.body, 'pay_url')
  assert.equal(order.address_id, payload.address_id)
  assert.equal(order.user_id, payload.user_id)
})

test('it should return 401 when not authenticated', async ({ client }) => {
  const response = await client
    .post('v1/orders')
    .end()

  response.assertStatus(401)
})

test('it should return 400 when address not exists', async ({ assert, client }) => {
  const user = await Factory
    .model('App/Models/User')
    .create()

  const payload = {
    address_id: Math.random() * 40
  }

  const response = await client
    .post('v1/orders')
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
  const user = await Factory
    .model('App/Models/User')
    .create()

  const payload = {
    items: [
      {}
    ]
  }

  const response = await client
    .post('v1/orders')
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
  const user = await Factory
    .model('App/Models/User')
    .create()

  const payload = {
    items: [
      {
        product_id: Math.random() * 40
      }
    ]
  }

  const response = await client
    .post('v1/orders')
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
  const user = await Factory
    .model('App/Models/User')
    .create()
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
    .post('v1/orders')
    .send(payload)
    .loginVia(user)
    .end()

  response.assertStatus(400)
  assert.property(response.body, 'errors')
  assert.equal(response.body.errors.length, 1)
  assert.equal(response.body.errors[0].validation, 'above')
  assert.equal(response.body.errors[0].field, 'items.0.quantity')
})
