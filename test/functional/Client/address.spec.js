'use strict'

const ClientAddressSuite = use('Test/Suite')('Client Address')
const { test, trait } = ClientAddressSuite

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

const Address = use('App/Models/Address')
const City = use('App/Models/City')

ClientAddressSuite.timeout(0)

const {
  createOrder,
  createAdmin,
  createAddress
} = require('../helpers')

trait('Test/ApiClient')
trait('Auth/Client')
trait('DatabaseTransactions')

test('it should list all addresses of authenticated user', async ({ client, assert }) => {
  const admin = await createAdmin()
  const user = await Factory
    .model('App/Models/User')
    .create()

  const addressOfAdmin = await createAddress(admin.id)
  const addressOfClient = await createAddress(user.id)

  const response = await client
    .get('v1/addresses/')
    .loginVia(user)
    .end()

  response.assertStatus(200)
  assert.notInclude(response.body.map(address => address.id), addressOfAdmin.id)
})

test('it should return 401 when not authenticated', async ({ client }) => {
  const response = await client
    .get('v1/addresses/')
    .end()

  response.assertStatus(401)
})

test('it should store an address', async ({ client, assert }) => {
  const user = await Factory
    .model('App/Models/User')
    .create()

  const { id: state_id } = await Factory.model('App/Models/State').create()
  const { id: city_id } = await City.create({ state_id, name: 'Marília' })

  const payload = {
      cep: 19816200,
      district: 'test',
      street: 'test',
      number: 123
    }

  const response = await client
    .post('v1/addresses/')
    .send(payload)
    .loginVia(user)
    .end()

  response.assertStatus(201)
  const address = await Address.find(response.body.id)
  assert.equal(address.cep, payload.cep)
  assert.equal(address.district, payload.district)
  assert.equal(address.street, payload.street)
  assert.equal(address.number, payload.number)
})

test('it should return 401 when not authenticated', async ({ client }) => {
  const response = await client
    .post('v1/addresses/')
    .end()

  response.assertStatus(401)
})
