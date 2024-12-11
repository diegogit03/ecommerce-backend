const { hooks } = require('@adonisjs/ignitor')

hooks.after.providersBooted(() => {
  const Validator = use('Validator')
  const Database = use('Database')

  const existsFn = async (data, field, message, args, get) => {
    const value = get(data, field)
    if (!value) {
      return
    }

    const [table, column] = args
    const row = await Database.table(table).where(column, value).first()

    if (!row) {
      throw message
    }
  }

  const relatedFn = async (data, field, message, [related, column, table], get) => {
    const value = get(data, field)
    if (!value) {
      return
    }

    const lastFieldInRelated = '.' + related.split('.').pop()
    const fieldContext = field.split('.')
    fieldContext.pop()

    console.log(fieldContext.join('.'), lastFieldInRelated)
    const relatedValue = get(data, fieldContext.join('.') + lastFieldInRelated)
    const row = await Database.table(table).where('id', value).where(column, relatedValue).first()

    if (!row) {
      throw message
    }
  }

  const arrayRequiredFn = async (data, field, message, [length], get) => {
    const value = get(data, field)
    if (!value || !Array.isArray(value) || value.length < length) {
      throw message
    }
  }

  Validator.extend('exists', existsFn)
  Validator.extend('relatedWith', relatedFn)
  Validator.extend('arrayRequired', arrayRequiredFn)
});
