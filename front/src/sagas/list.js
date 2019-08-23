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
import { takeEvery, put, call, race } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import { pushError } from '../actions/errors'
import { getErrorMessage } from '../utils'
import { setList, setLoading, setCount } from '../actions/statifications'

/**
 *
 * [listStatifications description]
 * @param  {[type]} limit [description]
 * @param  {[type]} skip  [description]
 * @return {[type]}       [description]
 */
function listStatifications (limit, skip) {
  return new Promise((resolve, reject) => {
    const url = `/api/statification/list?limit=${limit}&skip=${skip}`
    fetch(url, {
      method: 'POST',
      credentials: 'same-origin'
    }).then((response) => {
      response.json().then((data) => {
        if (data.success === false) {
          reject(new Error(data.error))
        } else {
          resolve(data.statifications)
        }
      })
    }).catch((error) => {
      reject(error)
    })
  })
}

/**
 * [listStatificationsSaga description]
 * @param  {[type]}    action [description]
 * @return {Generator}        [description]
 */
function * listStatificationsSaga (action) {
  try {
    yield put(setLoading(true))

    const { result, timeout } = yield race({
      result: call(listStatifications, action.limit, action.skip),
      timeout: call(delay, 20000)
    })
    if (timeout) { throw new Error('timeout') }

    yield put(setLoading(false))

    yield put(setList(result))
  } catch (error) {
    yield put(setLoading(false))
    yield put(pushError(getErrorMessage(error)))
  }
}

/**
 *
 * [countStatifications description]
 * @return {[type]} [description]
 */
function countStatifications () {
  return new Promise((resolve, reject) => {
    const url = '/api/statification/count'
    fetch(url, {
      method: 'GET',
      credentials: 'same-origin'
    }).then((response) => {
      response.json().then((data) => {
        if (data.success === false) {
          reject(new Error(data.error))
        } else {
          resolve(data.count)
        }
      })
    }).catch((error) => {
      reject(error)
    })
  })
}

/**
 * [countStatificationsSaga description]
 * @param  {[type]}    action [description]
 * @return {Generator}        [description]
 */
function * countStatificationsSaga (action) {
  try {
    const { result, timeout } = yield race({
      result: call(countStatifications),
      timeout: call(delay, 20000)
    })
    if (timeout) { throw new Error('timeout') }

    yield put(setCount(result))
  } catch (error) {
    yield put(pushError(getErrorMessage(error)))
  }
}

function * watchListSagas () {
  yield takeEvery('SAGA_LIST_STATIFICATIONS', listStatificationsSaga)
  yield takeEvery('SAGA_LIST_STATIFICATIONS_COUNT', countStatificationsSaga)
}

export default watchListSagas
