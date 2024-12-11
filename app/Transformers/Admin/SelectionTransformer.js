'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')
const OptionTransformer = use('App/Transformers/Admin/OptionTransformer')

/**
 * SelectionTransformer class
 *
 * @class SelectionTransformer
 * @constructor
 */
class SelectionTransformer extends BumblebeeTransformer {
  static get defaultInclude () {
    return ['options']
  }

  /**
   * This method is used to transform the data.
   */
  transform (model) {
    return {
      id: model.id,
      description: model.description
    }
  }

  includeOptions (model) {
    return this.collection(model.getRelated('options'), OptionTransformer)
  }
}

module.exports = SelectionTransformer
