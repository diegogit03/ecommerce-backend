'use strict'

const AuthSuite = use('Test/Suite')('Auth')
const { test, trait } = AuthSuite
/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

const User = use('App/Models/User')
const Role = use('Role')

const getToken = async (payload, client) => {
  const response = await client
    .post('v1/auth/login')
    .send(payload)
    .end()

  return response.body.data
}

AuthSuite.timeout(0)

trait('Test/ApiClient')
trait('DatabaseTransactions')

test('it should create an session', async ({ assert, client }) => {
  const user = await Factory
    .model('App/Models/User')
    .create()

  const response = await client
    .post('v1/auth/login')
    .send({
      email: user.email,
      password: 'secret'
    })
    .end()

  response.assertStatus(200)
  assert.property(response.body.data, 'type')
  assert.property(response.body.data, 'token')
  assert.property(response.body.data, 'refreshToken')
})

test('it should return 400 when required data is not provided', async ({ assert, client }) => {
 const response = await client
    .post('v1/auth/login')
    .end()

  response.assertStatus(400)
  assert.property(response.body, 'errors')
})

test('it should register an user', async ({ assert, client }) => {
  await Role.create({
    name: 'Client',
    slug: 'client',
    description: 'Cliente da loja!'
  })

  const payload = {
    name: 'test',
    surname: 'test',
    email: 'test@email.com',
    password: 'secret'
  }

  const response = await client
    .post('v1/auth/register')
    .send({
      ...payload,
      password_confirmation: payload.password
    })
    .end()

  response.assertStatus(201)
  const user = await User.find(response.body.data.id)
  assert.exists(user)
})

test('it should return 400 when required data is not provided', async ({ assert, client }) => {
 const response = await client
    .post('v1/auth/register')
    .end()

  response.assertStatus(400)
  assert.property(response.body, 'errors')
})

test('it should return 400 when email is invalid', async ({ assert, client }) => {
  const payload = {
    name: 'test',
    surname: 'test',
    email: 'test',
    password: 'secret'
  }

  const response = await client
    .post('v1/auth/register')
    .send({
      ...payload,
      password_confirmation: payload.password
    })
    .end()

  response.assertStatus(400)
  assert.property(response.body, 'errors')
})

test('it should return 400 when email already exists', async ({ assert, client }) => {
  const payload = {
    name: 'test',
    surname: 'test',
    email: 'test@email.com',
    password: 'secret'
  }

  await User.create(payload)

  const response = await client
    .post('v1/auth/register')
    .send({
      ...payload,
      password_confirmation: payload.password
    })
    .end()

  response.assertStatus(400)
  assert.property(response.body, 'errors')
})

test('it should refresh a token', async ({ assert, client }) => {
  const user = await Factory
    .model('App/Models/User')
    .create()

  const { refreshToken: refresh_token } = await getToken({
      email: user.email,
      password: 'secret'
    }, client)

  const response = await client
    .post('v1/auth/refresh')
    .send({
      refresh_token
    })
    .end()

  response.assertStatus(200)
  assert.property(response.body, 'data')
})

test('it should refresh a token when refresh_token on the header', async ({ assert, client }) => {
  const user = await Factory
    .model('App/Models/User')
    .create()

  const { refreshToken: refresh_token } = await getToken({
      email: user.email,
      password: 'secret'
    }, client)

  const response = await client
    .post('v1/auth/refresh')
    .header('refresh_token', refresh_token)
    .end()

  response.assertStatus(200)
  assert.property(response.body, 'data')
})

test('it should logout a token', async ({ client }) => {
  const user = await Factory
    .model('App/Models/User')
    .create()

  const { refreshToken: refresh_token, type, token } = await getToken({
      email: user.email,
      password: 'secret'
    }, client)

  const response = await client
    .post('v1/auth/logout')
    .header('Authorization', `${type} ${token}`)
    .send({
      refresh_token
    })
    .end()

  response.assertStatus(204)
})

test('it should logout a token when refresh_token on the header', async ({ client }) => {
  const user = await Factory
    .model('App/Models/User')
    .create()

  const { refreshToken: refresh_token, type, token } = await getToken({
      email: user.email,
      password: 'secret'
    }, client)

  const response = await client
    .post('v1/auth/logout')
    .header('refresh_token', refresh_token)
    .header('Authorization', `${type} ${token}`)
    .end()

  response.assertStatus(204)
})

test('it should return 401 when not athenticated', async ({ client }) => {
  const response = await client
    .post('v1/auth/logout')
    .end()

  response.assertStatus(401)
})

