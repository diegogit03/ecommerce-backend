'use strict'

class StoreOrder {
  get rules () {
    return {
      'address_id': 'required|number|exists:addresses,id',
      'items': 'arrayRequired:1',
      'items.*.product_id': 'number|required|exists:products,id',
      'items.*.quantity': 'number|above:0',

      'items.*.specifications': 'array',
      'items.*.specifications.*.selection_id': 'required|number|exists:selections,id',
      'items.*.specifications.*.option_id': 'required|number|relatedWith:items.*.specifications.*.selection_id,selection_id,options'
    }
  }

  get messages () {
    return {
      'items.*.product_id.exists': 'Este produto não existe!',
      'items.*.product_id.required': 'É necessario um produto por item',
      'items.*.quantity.min': 'A quantidade de um item está abaixo do minimo!',
      'address_id.exists': 'Este endereço não existe!',
    }
  }
}

module.exports = StoreOrder
