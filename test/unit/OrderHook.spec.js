'use strict'

const { ioc } = use('@adonisjs/fold')
const sinon = use("sinon");

const { test, afterEach } = use('Test/Suite')('OrdemHook')

const OrderItemHook = use('App/Models/Hooks/OrderItemHook')
const Product = use('App/Models/Product')

test('it should update values', async ({ assert }) => {
  const productStub = sinon.stub(Product, 'find')
  const orderFake = {

  }

  productStub.withArgs(orderItemFake.product_id).returns({
    price: 6
  })

  setFakeProduct(productStub)

  await OrderItemHook.updateSubtotal(orderItemFake)

  assert.equal(orderItemFake.subtotal, 12)

  productStub.restore()
})
