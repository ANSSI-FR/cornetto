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

const init = {
  open: false,
  title: '',
  text: '',
  typeAction: ''
}

const dialog = (state = Immutable.Map(init), action) => {
  switch (action.type) {
    case 'DIALOG_SET_OPEN':
      return state.set('open', action.open)
    case 'DIALOG_SET_TITLE':
      return state.set('title', action.title)
    case 'DIALOG_SET_TEXT':
      return state.set('text', action.text)
    case 'DIALOG_SET_TYPE_ACTION':
      return state.set('typeAction', action.typeAction)
    default:
      return state
  }
}

export default dialog
