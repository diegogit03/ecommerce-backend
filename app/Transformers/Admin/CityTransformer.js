'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')

const StateTransformer = use('App/Transformers/Admin/StateTransformer')

/**
 * CityTransformer class
 *
 * @class CityTransformer
 * @constructor
 */
class CityTransformer extends BumblebeeTransformer {
  static get defaultInclude () {
    return ['state'];
  }

  transform (model) {
    return {
      name: model.name
    }
  }

  includeState (city) {
    return this.item(city.getRelated('state'), StateTransformer)
  }
}

module.exports = CityTransformer
