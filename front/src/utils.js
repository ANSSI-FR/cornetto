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
import 'moment/locale/fr.js'
import { I18n } from 'react-redux-i18n'

/**
 * This method clear all the interval (created by setInterval method)
 */
export const clearAllSetInterval = () => {
  // try to clear one by one all possible interval id
  for (let i = 0; i < 9999; i++) {
    clearInterval(i)
  }
}

export const getErrorMessage = (error) => {
  console.log(error)
  if (error.message) {
    return I18n.t(`errors.text.${error.message}`)
  } else if (error) {
    return I18n.t(`infos.text.${error}`)
  } else {
    return I18n.t(`errors.text.unknown`)
  }
}

export const getInfoMessage = (info) => {
  if (info) {
    return I18n.t(`infos.text.${info}`)
  }
}
