'use strict'

const ClientProductsSuite = use('Test/Suite')('Client Products')
const { test, trait } = ClientProductsSuite

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

ClientProductsSuite.timeout(0)

trait('Test/ApiClient')
trait('Auth/Client')
trait('DatabaseTransactions')

test('it should list all products', async ({ client, assert }) => {
    const products = await Factory
        .model('App/Models/Product')
        .createMany(5)

    const response = await client
        .get('/v1/products')
        .end()

    response.assertStatus(200)

    const responseIds = response.body.data.map(
        product => product.id
    )

    products.forEach(product => {
        assert.include(responseIds, product.id)
    })
})

test('it should show a product', async ({ client, assert }) => {
   const product = await Factory
        .model('App/Models/Product')
        .create()

    const response = await client
        .get('/v1/products/' + product.id)
        .end()

    response.assertStatus(200)
    assert.equal(response.body.id, product.id)
    assert.equal(response.body.id, product.id)
})
