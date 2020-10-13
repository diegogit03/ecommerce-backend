'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.group(() => {
  /*
  * Category resource routes
  */
  Route.resource('categories', 'CategoryController').apiOnly()

  /*
  * Product resource routes
  */
  Route.resource('proudcts', 'ProductController').apiOnly()

  /*
  * Coupon resource routes
  */
  Route.resource('coupons', 'CouponController').apiOnly()

  /*
  * Coupon resource routes
  */
  Route.resource('orders', 'OrderController').apiOnly()

  /*
  * Image resource routes
  */
  Route.resource('image', 'ImageController').apiOnly()

  /*
  * User resource routes
  */
  Route.resource('users', 'UserController').apiOnly()
})
  .prefix('v1/admin')
  .namespace('Admin')
