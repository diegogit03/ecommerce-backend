'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.group(() => {
  Route.resource('addresses', 'AddressController').apiOnly().middleware(['auth'])

  /*
  * Product Resource Routes
  */
  Route.get('products', 'ProductController.index')
  Route.get('products/:id', 'ProductController.show')

  /*
  * Order resource Routes
  */
  Route.resource('orders', 'OrderController').apiOnly().middleware(['auth']).validator(new Map([
    [['orders.store', 'orders.update'], ['Admin/StoreOrder']],
  ]))
})
  .prefix('v1')
  .namespace('Client')
