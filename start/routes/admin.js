'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.group(() => {
  /*
  * Category resource routes
  */
  Route.resource('categories', 'CategoryController').apiOnly().validator(new Map([
    [['categories.store', 'categories.update'], ['Admin/StoreCategory']]
  ]))

  /*
  * Product resource routes
  */
  Route.resource('products', 'ProductController').apiOnly().validator(new Map([
    [['products.store', 'products.update'], ['Admin/StoreProduct']]
  ]))

  /*
  * Coupon resource routes
  */
  Route.resource('coupons', 'CouponController').apiOnly()

  /*
  * Order resource routes
  */
  Route.post('orders/:id/discount', 'OrderController.applyDiscount')
  Route.delete('orders/:id/discount', 'OrderController.removeDiscount')
  Route.resource('orders', 'OrderController').apiOnly().validator(new Map([
    [['orders.store', 'orders.update'], ['Admin/StoreOrder']],
  ]))

  /*
  * Image resource routes
  */
  Route.resource('images', 'ImageController').apiOnly()

  /*
  * User resource routes
  */
  Route.resource('users', 'UserController').apiOnly().validator(new Map(
    [[['users.store', 'users.update'], ['Admin/StoreUser']]],
  ))

  Route.get('dashboard', 'DashboardController.index').as('dashboard')
})
  .prefix('v1/admin')
  .namespace('Admin')
  .middleware(['auth', 'is:( admin || manager )'])
