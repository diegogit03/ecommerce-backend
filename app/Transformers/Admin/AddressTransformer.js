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
  static get defaultInclude () {
    return ['city']
  }

  static get availableInclude () {
    return ['user']
  }

  transform (model) {
    return {
      street: model.street,
      number: model.number,
      district: model.district,
      cep: model.cep,
    }
  }

  includeUser (address) {
    return this.item(address.getRelated('user'), UserTransformer)
  }

  includeCity (address) {
    return this.item(address.getRelated('city'), CityTransformer)
  }
}

module.exports = AddressTransformer
