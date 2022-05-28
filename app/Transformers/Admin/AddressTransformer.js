'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')

const UserTransformer = use('App/Transformers/Admin/UserTransformer')
const CityTransformer = use('App/Transformers/Admin/CityTransformer')

/**
 * AddressTransformer class
 *
 * @class AddressTransformer
 * @constructor
 */
class AddressTransformer extends BumblebeeTransformer {
  static get availableInclude () {
    return ['user', 'city']
  }

  transform (model) {
    return {
      street: model.street,
      number: model.number,
      district: model.district,
      cep: model.cep,
    }
  }

  includeUser (model) {
    return this.item(model.getRelated('user'), UserTransformer)
  }

  includeCity (model) {
    return this.item(model.getRelated('city'), CityTransformer)
  }
}

module.exports = AddressTransformer
