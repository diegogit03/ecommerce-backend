'use strict'

class StoreProduct {
  get rules () {
    return {
        name: 'required|string',
        description: 'required|string',
        price: 'required|number',
        image_id: 'integer|exists:images,id',

        selections: 'array',
        'selections.*.description': 'required|string',
        'selections.*.options': 'required|array',
        'selections.*.options.*.description': 'required|string',
        'selections.*.options.*.image_id': 'integer|exists:images,id',
        'selections.*.options.*.additional': 'required|number',
    }
  }

  get messages () {
    return {
      'name.required': 'O nome é obrigatório!',
      'name.string': 'O nome precisa ser um texto!',

      'description.required': 'A descrição é obrigatório!',
      'description.string': 'A descrição precisa ser um texto!',

      'price.required': 'O preço é obrigatório!',
      'price.number': 'O preço precisa ser um numero!',

      'image_id.integer': 'O id da imagem precisa ser um inteiro!',
      'image_id.exists': 'Está imagem não existe!',

      'selections.array': 'O selections precisa ser um array!',

      'selections.*.description.required': 'A descrição da é obrigatória!',
      'selections.*.options.required': 'As opções são obrigatórias!',
      'selections.*.options.array': 'As opções precisam ser um array!',

      'selections.*.options.*.description.required': 'A descrição é obrigatória!',
      'selections.*.options.*.description.string': 'A descrição precisa ser um texto!',
      'selections.*.options.*.image_id.integer': 'O id da imagem precisa ser um inteiro!',
      'selections.*.options.*.image_id.exists': 'Está imagem não existe!',
      'selections.*.options.*.additional.required': 'O valor do adicional é obrigatório',
      'selections.*.options.*.additional.number': 'O valor do adicional precisa ser um numero'
    }
  }
}

module.exports = StoreProduct
