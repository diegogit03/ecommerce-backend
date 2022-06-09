'use strict'

/*
|--------------------------------------------------------------------------
| Factory
|--------------------------------------------------------------------------
|
| Factories are used to define blueprints for database tables or Lucid
| models. Later you can use these blueprints to seed your database
| with dummy data.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

Factory.blueprint('App/Models/User', faker => {
  return {
    name: faker.first(),
    surname: faker.last(),
    email: faker.email({ domain: 'email.com' }),
    password: 'secret'
  }
})

Factory.blueprint('App/Models/Category', faker => {
  return {
    title: faker.country({ full: true }),
    description: faker.sentence(),
  }
})

Factory.blueprint('App/Models/Product', faker => {
  return {
    name: faker.animal(),
    description: faker.sentence(),
    price: faker.floating({ min: 0, max: 1000, fixed: 2 })
  }
})

Factory.blueprint('App/Models/Order', (faker, i, data) => {
  return {
    total: faker.floating({ min: 0, max: 1000, fixed: 2 }),
    status: data.status
  }
})

Factory.blueprint('App/Models/OrderItem', faker=> {
  return {
    quantity: faker.integer({ min: 0, max: 20 })
  }
})

Factory.blueprint('App/Models/Address', (faker, i, data) => {
  return {
    number: faker.integer({ min: 100, max: 999 }),
    street: faker.street(),
    district: faker.province({ min: 0, max: 20 }),
    cep: faker.zip(),
    city_id: data.city_id,
    user_id: data.user_id,
  }
})

Factory.blueprint('App/Models/City', (faker, i, data) => {
  return {
    name: faker.city(),
    state_id: data.state_id
  }
})

Factory.blueprint('App/Models/State', faker => {
  return {
    name: faker.state({ full: true })
  }
})

Factory.blueprint('App/Models/Image', faker => {
  return {}
})
