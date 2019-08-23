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
import { takeEvery, put } from 'redux-saga/effects'
import { getOptionsMaterialAsMap, getOptionsNativeAsMap } from '../utils'
import { setNative, setMaterial } from '../actions/options'

function * optionsSaga (action) {
  yield put(setNative(getOptionsNativeAsMap()))
  yield put(setMaterial(getOptionsMaterialAsMap()))
}

function * watchOptionsSaga () {
  yield takeEvery('OPTIONS_SAGA', optionsSaga)
}

export default watchOptionsSaga
