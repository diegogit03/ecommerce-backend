'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const MercadoPago = require('mercadopago')

const Database = use('Database')
const Order = use('App/Models/Order')

class NotificationController {
  store ({ request, response }) {
    const { id } = request.get()
    const filter = { 'order.id': id }

    setTimeout(async () => {
      const trx = await Database.beginTransaction()

      try {
        const paymentData = await MercadoPago.payment.search({ qs: filter })

        const payment = paymentData.body.results[0]

        if (payment !== undefined) {

          if (payment.status === 'approved') {
            const order = await Order.findByOrFail('pay_id', payment.external_reference)

            order.status = 'paid'

            await order.save(trx)

            await trx.commit()

            return response.status(204).json()
          }

        } else {

          return response.status(404).json({
            message: 'O pagamento não existe...'
          })

        }
      } catch (error) {

        await trx.rollback()
        return response.status(404).json({
          message: 'O pagamento não existe...'
        })

      }
    }, 10000)
  }
}

module.exports = NotificationController
