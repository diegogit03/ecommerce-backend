'use strict'

const { ioc } = use('@adonisjs/fold')
const sinon = use("sinon");

const { test, afterEach } = use('Test/Suite')('OrdemItemHook')

const OrderItemHook = use('App/Models/Hooks/OrderItemHook')
const Product = use('App/Models/Product')

function setFakeProduct (productFake) {
  ioc.fake('App/Models/Product', () => {
    return productFake
  })
}

test('it should update subtotal', async ({ assert }) => {
  const productStub = sinon.stub(Product, 'find')
  const orderItemFake = {
    product_id: 1,
    subtotal: 0,
    quantity: 2
  }

  productStub.withArgs(orderItemFake.product_id).returns({
    price: 6
  })

  setFakeProduct(productStub)

  await OrderItemHook.updateSubtotal(orderItemFake)

  assert.equal(orderItemFake.subtotal, 12)

  productStub.restore()
})

test('it should update subtotal with decimal numbers', async ({ assert }) => {
  const productStub = sinon.stub(Product, 'find')
  const orderItemFake = {
    product_id: 1,
    subtotal: 0,
    quantity: 2
  }

  productStub.withArgs(orderItemFake.product_id).returns({
    price: 1.60
  })

  setFakeProduct(productStub)

  await OrderItemHook.updateSubtotal(orderItemFake)

  assert.equal(orderItemFake.subtotal, 3.20)

  productStub.restore()
})

afterEach(() => ioc.fake('App/Models/Product', () => Product))
