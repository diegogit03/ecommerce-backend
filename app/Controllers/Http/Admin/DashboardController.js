'use strict'

const Database = use('Database')
const moment = require('moment')

const DATE_FORMAT = 'YYYY-MM-DD'

class DashboardController {

  async index () {
    const users = await Database.from('users').getCount()
    const orders = await Database.from('orders').getCount()
    const products = await Database.from('products').getCount()

    const chartquery = await Database.raw(`
      SELECT DAYNAME(ord.created_at) AS date, (SUM(item.subtotal) - COALESCE(SUM(coupon_order.discount), 0)) AS total
        FROM orders AS ord INNER JOIN order_items as item ON item.order_id = ord.id LEFT OUTER JOIN coupon_order ON coupon_order.order_id = ord.id
        WHERE ord.created_at BETWEEN ? AND ? AND ord.status = 'finished'
        GROUP BY DAY(ord.created_at);
    `, [
      moment().subtract(1, 'week').format(DATE_FORMAT),
      moment().format(DATE_FORMAT)
    ])
	
	const chart = await Database.select('created_at').from('orders');

    const subtotal = await Database.from('order_items').getSum('subtotal')
    const discounts = await Database.from('coupon_order').getSum('discount')
    const revenues = subtotal - discounts

    return { users, orders, products, revenues }
  }

}

module.exports = DashboardController
