/*
 Cornetto

 Copyright (C) 2018–2019 ANSSI
 Contributors:
 2018–2019 Paul Fayoux paul.fayoux@ssi.gouv.fr
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.
 You should have received a copy of the GNU General Public License
 */
import Immutable from 'immutable'

const initError = {
  message: '',
  severity: 'error'
}

const init = {
  errors: Immutable.List()
}

const errors = (state = Immutable.Map(init), action) => {
  switch (action.type) {
    case 'ERROR_CLEAR_ALL':
      return Immutable.Map(init)
    case 'ERROR_PUSH':
      // limit the number of errors in the list to 5
      if (state.get('errors').size >= 5) {
        // remove first error and shift other value to lower index
        state = state.set('errors', state.get('errors').shift())
      }

      // erase all previous errors if the new error is of severity 'error'
      if (action.severity === 'error') {
        state = state.set('errors', state.get('errors').clear())
      }

      const errors = state.get('errors').push(Immutable.Map(initError).set('message', action.message).set('severity', action.severity))
      // add the new error to the list of errors
      return state.set('errors', errors)
    case 'ERROR_DISMISS':
      if (state.get('errors').has(action.position)) {
        return state.set('errors', state.get('errors').delete(action.position))
      }
      return state
    default:
      return state
  }
}

export default errors
