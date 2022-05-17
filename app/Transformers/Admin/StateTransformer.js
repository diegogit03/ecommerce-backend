'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')

/**
 * StateTransformer class
 *
 * @class StateTransformer
 * @constructor
 */
class StateTransformer extends BumblebeeTransformer {
  /**
   * This method is used to transform the data.
   */
  transform (model) {
    return {
      name: model.name
    }
  }
}

module.exports = StateTransformer
