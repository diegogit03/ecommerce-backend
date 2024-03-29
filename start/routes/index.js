'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/uploads/:name', 'UploadController.show')
Route.get('v1/me', 'UserController.me').as('me').middleware('auth')
Route.post('v1/pay/notification', 'Pay/NotificationController.store').as('pay.notification')

/*
* importa as rotas de Autenticação
*/

require('./auth')

/*
* importa as rotas de Admin
*/

require('./admin')

/*
* importa as rotas de Clientes
*/

require('./client')
