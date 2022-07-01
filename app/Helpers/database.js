'use strict'

const Database = use('Database')

/**
 * Returns a transaction or fake transaction
 */
const getTransaction = async () => {
  const globalTrx = Database.connection()._globalTrx
  return globalTrx ? { commit () {}, rollback () {} } : await Database.beginTransaction()
}

module.exports = {
  getTransaction
}
