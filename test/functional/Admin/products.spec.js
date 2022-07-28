'use strict'

const AdminProductsSuite = use('Test/Suite')('Admin Products')
const { test, trait } = AdminProductsSuite

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

const Product = use('App/Models/Product')

AdminProductsSuite.timeout(0)

const { createAdmin, createOrder } = require('../helpers')

trait('Test/ApiClient')
trait('Auth/Client')
trait('DatabaseTransactions')

test('It should store an product', async ({ client }) => {
  const user = await createAdmin()
  const productImage = await Factory.model('App/Models/Image').create()
  const productYellowImage = await Factory.model('App/Models/Image').create()

  const payload = {
    name: 'test',
    description: 'test description',
    price: 12.2,
    image_id: productImage.id,
    selections: [
      {
        description: 'Select a color:',
        options: [
          {
            description: 'Yellow',
            image_id: productYellowImage.id
          }
        ]
      }
    ]
  }

  const response = await client
    .post('v1/admin/products/')
    .send(payload)
    .loginVia(user)
    .end()

  response.assertStatus(201)
  response.assertJSONSubset({
    name: payload.name,
    description: payload.description,
    price: productImage.price,
    selections: [
      {
        description: 'Select a color:',
        options: [
          {
            description: 'Yellow',
          }
        ]
      }
    ]
  })
})
