'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')
const ImageTransformer = use('App/Transformers/Admin/ImageTransformer')
const AddressTransformer = use('App/Transformers/Admin/AddressTransformer')

/**
 * UserTransformer class
 *
 * @class UserTransformer
 * @constructor
 */
class UserTransformer extends BumblebeeTransformer {
  static get defaultInclude () {
    return ['image', 'addresses']
  }

  /**
   * This method is used to transform the data.
   */
  transform (model) {
    return {
     id: model.id,
     name: model.name,
     surname: model.surname,
     email: model.email,
    }
  }

  includeImage (model) {
    return this.item(model.getRelated('image'), ImageTransformer)
  }

  includeAddresses (model) {
    return this.collection(model.getRelated('addresses'), AddressTransformer)
  }
}

module.exports = UserTransformer
