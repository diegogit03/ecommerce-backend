'use strict'

const AdminUserSuite = use('Test/Suite')('Admin User')
const { test, trait } = AdminUserSuite

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

const User = use('App/Models/User')

AdminUserSuite.timeout(0)

const { createAdmin } = require('../helpers')

trait('Test/ApiClient')
trait('Auth/Client')
trait('DatabaseTransactions')

test('it should show an user', async ({ assert, client }) => {
  const user = await createAdmin()

  const response = await client
    .get('v1/admin/users/' + user.id)
    .loginVia(user)
    .end()

  response.assertStatus(200)
  assert.property(response.body, 'image')
  assert.property(response.body, 'addresses')
})

test('it should return 401 when not authenticated', async ({ client }) => {
  const response = await client
    .get('v1/admin/users/1')
    .end()

  response.assertStatus(401)
})

test('it should return 403 when user not a admin', async ({ client }) => {
  const user = await Factory
    .model('App/Models/User')
    .create()

  const response = await client
    .get('v1/admin/users/1')
    .loginVia(user)
    .end()

  response.assertStatus(403)
})

test('it should list users', async ({ client }) => {
  const user = await createAdmin()

  const response = await client
    .get('v1/admin/users/')
    .loginVia(user)
    .end()

  response.assertStatus(200)
})

test('it should list users with id filter', async ({ assert, client }) => {
  const user = await createAdmin()

  const response = await client
    .get('v1/admin/users/?id=1')
    .loginVia(user)
    .end()

  response.assertStatus(200)
  assert.equal(response.body.data.length, 1)
  assert.equal(response.body.data[0].id, 1)
})

test('it should return 401 when not authenticated', async ({ client }) => {
  const response = await client
    .get('v1/admin/users/')
    .end()

  response.assertStatus(401)
})

test('it should return 403 when user not a admin', async ({ client }) => {
  const user = await Factory
    .model('App/Models/User')
    .create()

  const response = await client
    .get('v1/admin/users/')
    .loginVia(user)
    .end()

  response.assertStatus(403)
})

test('it should delete an user', async ({ assert, client }) => {
  let user = await createAdmin()

  const response = await client
    .delete('v1/admin/users/' + user.id)
    .loginVia(user)
    .end()

  response.assertStatus(204)
  user = await User.find(user.id)
  assert.isNull(user)
})

test('it should return 401 when not authenticated', async ({ client }) => {
  const response = await client
    .delete('v1/admin/users/1')
    .end()

  response.assertStatus(401)
})

test('it should return 403 when user not a admin', async ({ client }) => {
  const user = await Factory
    .model('App/Models/User')
    .create()

  const response = await client
    .delete('v1/admin/users/1')
    .loginVia(user)
    .end()

  response.assertStatus(403)
})

test('it should store an user', async ({ assert, client }) => {
  let admin = await createAdmin()

  const image = await Factory.model('App/Models/Image').create()

  const payload = {
    image_id: image.id,
    name: 'test',
    surname: 'test',
    password: 'test',
    email: 'test@test.com'
  }

  const response = await client
    .post('v1/admin/users')
    .send(payload)
    .loginVia(admin)
    .end()

  response.assertStatus(201)
  const user = await User.find(response.body.id)
  assert.isNotNull(user)
  assert.equal(user.image_id, payload.image_id)
  assert.equal(user.name, payload.name)
  assert.equal(user.username, payload.username)
  assert.equal(user.email, payload.email)
})

test('it should return 401 when not authenticated', async ({ client }) => {
  const response = await client
    .post('v1/admin/users')
    .end()

  response.assertStatus(401)
})

test('it should return 403 when user not a admin', async ({ client }) => {
  const user = await Factory
    .model('App/Models/User')
    .create()

  const response = await client
    .post('v1/admin/users')
    .loginVia(user)
    .end()

  response.assertStatus(403)
})

test('it should return 400 when image not exists', async ({ assert, client }) => {
  const user = await createAdmin()

  const payload = {
    image_id: Math.random() * 40,
    email: 'test@test.com'
  }

  const response = await client
    .post('v1/admin/users')
    .send(payload)
    .loginVia(user)
    .end()

  response.assertStatus(400)
  assert.property(response.body, 'errors')
  assert.equal(response.body.errors.length, 1)
  assert.equal(response.body.errors[0].validation, 'exists')
  assert.equal(response.body.errors[0].field, 'image_id')
})

test('it should return 400 when required data is not provided', async ({ assert, client }) => {
  const user = await createAdmin()

  const payload = {}

  const response = await client
    .post('v1/admin/users')
    .send(payload)
    .loginVia(user)
    .end()

  response.assertStatus(400)
  assert.property(response.body, 'errors')
  assert.equal(response.body.errors.length, 1)
  assert.equal(response.body.errors[0].validation, 'required')
})

test('it should update an user', async ({ assert, client }) => {
  const admin = await createAdmin()

  const image = await Factory.model('App/Models/Image').create()

  const payload = {
    image_id: image.id,
    name: 'test',
    surname: 'test',
    password: 'test',
    email: 'test@test.com'
  }

  const response = await client
    .put('v1/admin/users/' + admin.id)
    .send(payload)
    .loginVia(admin)
    .end()

  response.assertStatus(200)
  await admin.reload()
  assert.equal(admin.image_id, payload.image_id)
  assert.equal(admin.name, payload.name)
  assert.equal(admin.surname, payload.surname)
  assert.equal(admin.email, payload.email)
})

test('it should return 401 when not authenticated', async ({ client }) => {
  const response = await client
    .put('v1/admin/users/1')
    .end()

  response.assertStatus(401)
})

test('it should return 403 when user not a admin', async ({ client }) => {
  const user = await Factory
    .model('App/Models/User')
    .create()

  const response = await client
    .put('v1/admin/users/1')
    .loginVia(user)
    .end()

  response.assertStatus(403)
})

test('it should return 400 when image not exists', async ({ assert, client }) => {
  const user = await createAdmin()

  const payload = {
    image_id: Math.random() * 40,
    email: 'test@test.com'
  }

  const response = await client
    .put('v1/admin/users/' + user.id)
    .send(payload)
    .loginVia(user)
    .end()

  response.assertStatus(400)
  assert.property(response.body, 'errors')
  assert.equal(response.body.errors.length, 1)
  assert.equal(response.body.errors[0].validation, 'exists')
  assert.equal(response.body.errors[0].field, 'image_id')
})
