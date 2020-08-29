'use strict'

const OrderHook = exports = module.exports = {}

OrderHook.updateValues = async (model) => {
    model.SsideLoaded.subtotal = await model.items().getSum('subtotal')
    model.SsideLoaded.qty_items = await model.items().getSum('quantity')
    model.SsideLoaded.discount = await model.discounts().getSum('discount')
    model.total = model.SsideLoaded.subtotal - model.SsideLoaded.discount
}

OrderHook.updateCollectionValues = async (models) => {
    for (let model of models) {
        model = await OrderHook.updateValues(model)  
    }
}