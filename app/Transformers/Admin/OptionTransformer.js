'use strict'


const BumblebeeTransformer = use('Bumblebee/Transformer')
const ImageTransformer = use('App/Transformers/Admin/ImageTransformer')
const SelectionTransformer = use('App/Transformers/Admin/SelectionTransformer')

/**
 * OptionTransformer class
 *
 * @class OptionTransformer
 * @constructor
 */
class OptionTransformer extends BumblebeeTransformer {
  static get defaultInclude () {
    return ['image']
  }

  static get availableInclude () {
    return ['selection'];
  }

  /**
   * This method is used to transform the data.
   */
  transform (model) {
    return {
      id: model.id,
      description: model.description,
      additional: model.additional
    }
  }

  includeImage (model) {
    return this.item(model.getRelated('image'), ImageTransformer)
  }

  includeSelection (model) {
    return this.item(model.getRelated('selection'), SelectionTransformer)
  }
}

module.exports = OptionTransformer
