'use strict'

const AdminOrderSuite = use('Test/Suite')('Admin Orders')
const { test, trait } = AdminOrderSuite

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

const Order = use('App/Models/Order')

AdminOrderSuite.timeout(0)

const { createAdmin, createOrder } = require('../helpers')

trait('Test/ApiClient')
trait('Auth/Client')
trait('DatabaseTransactions')
