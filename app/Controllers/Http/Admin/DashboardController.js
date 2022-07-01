'use strict'

const Database = use('Database')
const moment = require('moment')

const DATE_FORMAT = 'YYYY-MM-DD'

function getDayNameQuery (column) {
  let query = ''

  switch (Database.connection().connectionClient) {
    case 'pg':
      query = `to_char(${column}, 'Dy')`
      break;
    case 'sqlite3':
      query = column
      break;
    default:
      query = `DAYNAME(${column})`
  }

  return query
}

function getDayQuery (column) {
  let query = ''

  switch (Database.connection().connectionClient) {
    case 'pg':
      query = `TO_CHAR(${column}, 'TMDay')`
      break;
    case 'sqlite3':
      query = column
      break;
    default:
      query = `DAY(${column})`
  }

  return query
}

class DashboardController {

  async index () {
    const users = await Database.from('users').getCount()
    const orders = await Database.from('orders').getCount()
    const products = await Database.from('products').getCount()

    let dayNameQuery = getDayNameQuery('ord.created_at')
    let dayQuery = getDayQuery('ord.created_at')

    // TODO: make chart query
    // const chartquery = `
    //   SELECT ${dayNameQuery} AS date, (SUM(item.subtotal) - COALESCE(SUM(coupon_order.discount), 0)) AS total
    //     FROM orders AS ord INNER JOIN order_items as item ON item.order_id = ord.id LEFT OUTER JOIN coupon_order ON coupon_order.order_id = ord.id
    //     WHERE ord.created_at BETWEEN ? AND ? AND ord.status = 'finished'
    //     GROUP BY ${dayQuery};
    // `

	  // const chart = await Database.raw(chartquery, [
    //   moment().subtract(1, 'week').format(DATE_FORMAT),
    //   moment().format(DATE_FORMAT)
    // ])

    const subtotal = await Database.from('order_items').getSum('subtotal')
    const discounts = await Database.from('coupon_order').getSum('discount')
    const revenues = subtotal - discounts

    return { users, orders, products, revenues }
  }

}

module.exports = DashboardController
