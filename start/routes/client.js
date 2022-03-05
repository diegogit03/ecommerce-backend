'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.group(() => {
  Route.resource('addresses', 'AddressController').middleware(['auth'])

  /*
  * Product Resource Routes
  */
  Route.get('products', 'ProductController.index')
  Route.get('product/:id', 'ProductController.show')

  /*
  * Order resource Routes
  */
  Route.get('orders', 'OrderController.index').middleware(['auth'])
  Route.get('order/:id', 'OrderController.show').middleware(['auth'])
  Route.post('orders', 'OrderController.store')
  Route.put('orders/:id', 'OrderController.update')
})
  .prefix('v1')
  .namespace('Client')
