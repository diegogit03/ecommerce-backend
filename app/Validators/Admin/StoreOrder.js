'use strict'

class StoreOrder {
  get rules () {
    return {
      'address_id': 'exists:addresses,id',
      'items.*.product_id': 'required|exists:products,id',
      'items.*.quantity': 'above:0'
    }
  }

  get messages () {
    return {
      'items.*.product_id.exists': 'Este produto não existe!',
      'items.*.product_id.required': 'É necessario um produto por item',
      'items.*.quantity.min': 'A quantidade de um item está abaixo do minimo!',
      'address_id.exists': 'Este endereço não existe!'
    }
  }
}

module.exports = StoreOrder
