'use strict'

/*
|--------------------------------------------------------------------------
| StateAndCitySeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

const State = use('App/Models/State')
const City = use('App/Models/City')

class StateAndCitySeeder {
  async run () {
    const state = await State.create({
      name: 'SP'
    })

    await City.create({
      state_id: state.id,
      name: 'Marília'
    })
  }
}

module.exports = StateAndCitySeeder
