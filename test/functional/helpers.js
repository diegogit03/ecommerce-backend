'use strict'

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

const Role = use('Role')

const createAddress = async (user_id) => {
  const { id: state_id } = await Factory.model('App/Models/State').create()
  const { id: city_id } = await Factory.model('App/Models/City').create({ state_id })
  const address = await Factory.model('App/Models/Address').create({ city_id, user_id })

  return address
}

exports.createAddress = createAddress

exports.createAdmin = async () => {
  const adminRole = await Role.create({
    name: 'Admin',
    slug: 'admin',
    description: 'Administrador do sistema!'
  })

  const user = await Factory
    .model('App/Models/User')
    .create()

  user.roles().attach([adminRole.id])

  return user
}

exports.createOrder = async (user, quantity = 1, status = 'finished') => {
  const product = await Factory.model('App/Models/Product').make()
  const item = await Factory.model('App/Models/OrderItem').make()

  const address = await createAddress(user.id)

  const mountOrder = async (order) => {
    await item.product().associate(product)
    await order.items().save(item)
    await order.address().associate(address)
    await order.user().associate(user)
  }

  if (quantity > 1) {
    const orders = await Factory
      .model('App/Models/Order')
      .createMany(quantity, { status })

    await Promise.all(
      orders.map(order => mountOrder(order))
    )

    return orders
  }

  const order = await Factory
    .model('App/Models/Order')
    .create({ status })

  await mountOrder(order)

  return order
}
