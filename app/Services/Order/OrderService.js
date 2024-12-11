'use strict'

/** @type {import('@adonisjs/lucid/src/Database')} */
const Database = use('Database')

class OrderService {
  constructor(model, trx) {
    this.model = model;
    this.trx = trx;
  }

  async syncItems(items) {
    if(!Array.isArray(items))
      return false;

    await this.model.items().delete(this.trx)
    await Promise.all(items.map(async ({ product_id, quantity, specifications }) => {
      const createdItem = await this.model.items().create({ product_id, quantity }, this.trx)
      if(specifications && Array.isArray(specifications))
        await createdItem.specifications().createMany(specifications, this.trx)
    }))
  }

  async updateItems(items) {
    const newItems = items.filter(item => !item.id)

    if (newItems.length) {
      const result = await this.model.items().createMany(newItems, this.trx)
      items = items.filter(item => item.id)
      result.map(item => item.toJSON()).forEach(item => items.push(item))
    }

    let currentItems = await this.model
      .items()
      .whereIn('id', items.map(item => item.id))
      .fetch()

    // deleta os itens que o user não quer mais
    await this.model
      .items()
      .whereNotIn('id', items.map(item => item.id))
      .delete(this.trx)

    // atualiza os valores e quantidades
    await Promise.all(currentItems.rows.map(async item => {
      item.fill(items.find(n => n.id === item.id))
      await item.save(this.trx)
    }))
  }

  async canApplyDiscount(coupon) {
    // verifica a validade por data

    const now = new Date().getTime()
    if (now > coupon.valid_from.getTime() || (typeof coupon.valid_until == 'object' && coupon.valid_until.getTime() < now)) {
      return false
    }

    const couponProducts = await Database.from('coupon_products')
      .where('coupon_id', coupon.id)
      .pluck('product_id')

    const couponClients = await Database.from('coupon_user')
      .where('coupon_id', coupon.id)
      .pluck('user_id')

    // verificar se o cupom está associado a produtos e clientes especifícos
    if(
      Array.isArray(couponProducts) &&
      couponClients.length < 1 &&
      Array.isArray(couponClients) &&
      couponClients.length < 1
    ) {
      /**
       * Caso não esteja associado a cliente ou produto especifico, é de uso livre
       */
      return true
    }

    let isAssociatedToProducts,
      isAssociatedToClients = false

    if(Array.isArray(couponProducts) && couponProducts.length > 0) {
      isAssociatedToProducts = true
    }

    if(Array.isArray(couponClients) && couponClients.length > 0) {
      isAssociatedToClients = true
    }

    const productsMatch = await Database.from('order_items')
      .where('order_id', this.model.id)
      .whereIn('product_id', coupon)
      .pluck('product_id')

    /**
     * Caso de uso 1 - o cupom está associado a clientes & produtos
     */
    if(isAssociatedToClients && isAssociatedToClients) {
      const clientMatch = couponClients.find(
        client => client === this.model.user_id
      )

      if(
        clientMatch &&
        Array.isArray(productsMatch) &&
        productsMatch.length > 0
      ) {
        return true;
      }
    }

    /**
     * Caso de uso 2 - o cupom está associado apenas a produto
     */
    if(
      isAssociatedToProducts &&
      Array.isArray(productsMatch) &&
      productsMatch.length > 0
    ) {
      return true
    }

    /**
     * Caso de uso 3 - o cupom está associado a 1 ou mais clientes (e nenhum produto)
     */
    if(
      isAssociatedToClients &&
      Array.isArray(couponClients) &&
      couponClients.length > 0
    ) {
      const match = couponClients(client => client === this.model.user_id)
      if(match)
        return true;
    }

    /**
     * Caso nenhuma das verificação acima deem positivas
     * então o cupom está associado a clientes ou produtos ou os dois
     * porém nenhum dos produtos deste pedido está elegivel ao desconto
     * e o cliente fez a compra também não poderá utilizar este cupom
     */
    return false
  }
}

module.exports = OrderService
