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
import { I18n } from 'react-redux-i18n'
import { pushError } from '../actions/errors'
import { getErrorMessage, getInfoMessage, clearAllSetInterval } from '../utils'

import {
  setFormData, setFormErrors, setFormLoading, setLoading, setWaitForServer, setListInfoLoading,
  setListErrorsTypeMime, setListScrapyErrors, setListHtmlErrors,
  setListScannedFiles, setListExternalLinks, setListStatificationHistorics,
  setStatificationRunning, setStatificationProgress, setActiveStep, setCommitSha,
  setListErrorErrorsTypeMime, setListErrorScrapyErrors, setListErrorHtmlErrors,
  setListErrorScannedFiles, setListErrorExternalLinks, setListErrorStatificationHistorics, clearListErrorInfo, setClearInterval
}
  from '../actions/statifications'
import { setDialogOpen, setDialogTitle, setDialogText, setDialogTypeAction } from '../actions/dialog'
import { statificationsCheckCurrentLog, listStatifications, countStatifications, statificationsLoadData } from '../actions/sagas'

/**
 * Method that treat the query to the server to load the data of a statification
 * @param  {[type]} commitSha the commit sha of the statification to get
 * @return {[type]}           json object of the statification
 */
function loadData (commitSha) {
  // create a promise to handle the answer of the server
  return new Promise((resolve, reject) => {
    // send the query
    fetch(`/api/statification?commit=${commitSha}`, {
      method: 'POST',
      credentials: 'same-origin'
    })
      .then((response) => {
        response.json().then((data) => {
          if (data.success !== false) {
            resolve(data)
          } else {
            reject(new Error(data.error))
          }
        })
      }).catch((error) => {
        reject(error)
      })
  })
}

/**
 * Get a Statification object from the API given a commit sha,
 * then load the datas of the statification into the page that list the informations
 * @param  {[type]}    action [description]
 * @return {Generator}        [description]
 */
function * loadDataSaga (action) {
  try {
    // show the loading gif in the infos list
    yield put(setListInfoLoading(true))

    // do a race between loadData and delay, and store the result respectively in result and timeout
    const { result, timeout } = yield race({
      // call loadData to do the request with the parameter 'commitSha' passed with the action
      result: call(loadData, action.commitSha),

      // define the timeout in case the server take too long to answer
      timeout: call(delay, 20000)
    })

    // if we reach the timeout then throw an error
    if (timeout) { throw new Error('timeout') }

    // put the statification returned by the server in the form
    yield put(setFormData(result.statification))

    // empty the error field of the form
    yield put(setFormErrors([]))

    // if there is an array of errors type mime, we set the errors in the list associated
    if (result.errors_type_mime !== undefined) {
      yield put(setListErrorsTypeMime(result.errors_type_mime))
    }

    // if there is an array of scrapy erros, we set the errors in the list associated
    if (result.scrapy_errors !== undefined) {
      yield put(setListScrapyErrors(result.scrapy_errors))
    }

    // if there is an array of html errors, we set the errors in the list associated
    if (result.html_errors !== undefined) {
      yield put(setListHtmlErrors(result.html_errors))
    }

    // if there is an array of scanned files, we set the errors in the list associated
    if (result.scanned_files !== undefined) {
      yield put(setListScannedFiles(result.scanned_files))
    }

    // if there is an array of external links, we set the errors in the list associated
    if (result.external_links !== undefined) {
      yield put(setListExternalLinks(result.external_links))
    }

    // if there is an array of historic, we set the errors in the list associated
    if (result.statification_historics !== undefined) {
      yield put(setListStatificationHistorics(result.statification_historics))
    }

    // catch the HTML error send by the server
  } catch (error) {
    // print a corresponding message to the user
    yield put(pushError(getErrorMessage(error)))
  } finally {
    // hide the loading gif in the infos list
    yield put(setListInfoLoading(false))
  }
}

/**
 * [checkProcess description]
 * @return {[type]} [description]
 */
function checkStatusProcess () {
  return new Promise((resolve, reject) => {
    fetch('/api/statification/status', {
      method: 'POST',
      credentials: 'same-origin',
      headers: new Headers({ 'Content-Type': 'application/json' })
    }).then((response) => {
      response.json().then((data) => {
        if (data.success === false) {
          reject(new Error(data.error))
        } else {
          resolve(data)
        }
      })
    }).catch((error) => {
      reject(error)
    })
  })
}

/**
 * [checkStatusProcess description]
 * @return {[type]} [description]
 */
function * checkStatusProcessSaga (action) {
  try {
    // send the submit request to the server
    const { result, timeout } = yield race({
      result: call(checkStatusProcess),
      timeout: call(delay, 8000)
    })
    if (timeout) { throw new Error('timeout') }

    // open a popup and send user to create page if status is not 3 (published) or 2 (commited) or visualized
    if (result.status !== 4 && result.status !== 3 && result.status !== 2 && window.location.pathname.search('list') >= 0) {
      // setup the dialog and show it to the user
      yield put(setDialogTitle(I18n.t('statification.dialog.redirect_process_running.title')))
      yield put(setDialogText(I18n.t('statification.dialog.redirect_process_running.text')))
      yield put(setDialogTypeAction('redirect_process_running'))
      yield put(setDialogOpen(true))
    }

    // if a background process has trigger an error
    if (action.waitForServer === true && result.statusBackground && !result.statusBackground.success && result.statusBackground.error) {
      // print a corresponding message to the user
      yield put(pushError(getErrorMessage(result.statusBackground.error), 'warn'))
      // if a background process has terminated then remove loading wheel
      yield put(setLoading(false))
      yield put(setWaitForServer(false))
    } else if (action.waitForServer === true && result.statusBackground && result.statusBackground.success && result.statusBackground.operation) {
      // if a background process has finished
      yield put(pushError(getInfoMessage(result.statusBackground.operation), 'info'))
      // if a background process has terminated then remove loading wheel
      yield put(setLoading(false))
      yield put(setWaitForServer(false))
    }

    // if a background process that return a commit SHA has finished
    if (result.statusBackground && result.statusBackground.commit) {
      // register the commit sha of the last commited statification
      yield put(setCommitSha(result.statusBackground.commit))
    } else {
      // register the commit sha of the last statification
      yield put(setCommitSha(result.commit))
    }

    // if the process is running
    if (result.isRunning) {
      // if a process is running then user should be on step 0
      yield put(setActiveStep(0))
      //  add the progressbar in the form
      yield put(setStatificationRunning(true))
      yield put(setStatificationProgress(result.currentNbItemCrawled, result.nbItemToCrawl))
      // set the designation and description of the current statification
      yield put(setFormData({ designation: result.designation, description: result.description }))
    } else {
      // when the statification process is finished and if current step is not 1 and not 2, check the logs of the statification
      if (result.status === 1 && action.step !== 1 && action.step !== 2) {
        yield put(statificationsCheckCurrentLog())
      } else if (action.waitForServer === true && result.statusBackground && result.statusBackground.success && result.statusBackground.operation === 'pushtoprod' && result.statusBackground.commit) {
        // case pushToProd
        // refresh the list and count
        yield put(countStatifications())
        yield put(listStatifications())
        // refresh list statification
        yield put(statificationsLoadData(result.statusBackground.commit))
        // redirect user to step 0
        yield put(setActiveStep(0))
        // open in a new tab the push to prod statification
        yield window.open(I18n.t('url.site_prod'), '_blanck').focus()
      } else if (action.waitForServer === true && result.statusBackground && result.statusBackground.success && result.statusBackground.operation === 'visualize' && result.statusBackground.commit) {
        // refresh the list and count
        yield put(countStatifications())
        yield put(listStatifications())
        // refresh visualized statification
        yield put(statificationsLoadData(result.statusBackground.commit))
        // open in a new tab the visualized statification
        yield window.open(I18n.t('url.site_visualize'), '_blank').focus()
      } else if (result.status === 2 && result.statusBackground && result.statusBackground.success && result.statusBackground.operation === 'commit' && action.step === 2) {
        // case commit finish user in step 2
        // if status is 2, statusBackground is success and operation is commit, it means the commit operations has finished so if we are in step 2 we need to pass to step 3
        yield put(setActiveStep(3))
        // clear the list of error after an operation of commit
        yield put(clearListErrorInfo())
      } else if ((result.status === 2 && result.statusBackground && result.statusBackground.success && result.statusBackground.operation === 'commit' && action.step !== 3)) {
        // case commit finish user not in step 2 and not in step 3
        // if the status is 2 (commited) and not in step 3 (push to prod button), or if status is 3 (pushed to prod) then the step should be 0
        yield put(setActiveStep(0))
        // clear the list of error after an operation of commit
        yield put(clearListErrorInfo())
      }

      //  remove the progressbar in the form
      yield put(setStatificationRunning(false))
      yield put(setStatificationProgress(0, result.nbItemToCrawl))
    }
    // catch the HTML error send by the server
  } catch (error) {
    // print a corresponding message to the user
    yield put(pushError(getErrorMessage(error), 'warn'))
  }
}

/**
 *
 * [submitForm description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function submitForm (data) {
  return new Promise((resolve, reject) => {
    fetch('/api/statification/start', {
      method: 'POST',
      credentials: 'same-origin',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data)
    }).then((response) => {
      response.json().then((data) => {
        if (data.success === false) {
          reject(new Error(data.error))
        } else {
          resolve(data.success)
        }
      })
    }).catch((error) => {
      reject(error)
    })
  })
}

/**
 * This method send the form to the API and start the statification process
 * @param  {[type]}    action the action object containing parameters
 */
function * submitFormSaga (action) {
  try {
    // set the loading wheel in the form
    yield put(setFormLoading(true))
    yield put(setLoading(true))

    // send the submit request to the server
    const { result, timeout } = yield race({
      result: call(submitForm, action.data),
      timeout: call(delay, 120000)
    })
    if (timeout) { throw new Error('timeout') }
    // if the process has started
    if (result) {
      // set the progressbar in the form
      yield put(setStatificationRunning(true))
    }
    // catch the HTML error send by the server
  } catch (error) {
    if (error === 'route_access') {
      // print a corresponding message to the user
      yield put(pushError(getErrorMessage(error), 'warn'))
    } else {
    // print a corresponding message to the user
      yield put(pushError(getErrorMessage(error)))
    }
  } finally {
    // stop the loading wheel
    yield put(setFormLoading(false))
    yield put(setLoading(false))
  }
}

/**
 *
 * [checkProcess description]
 * @return {[type]} [description]
 */
function stopProcess () {
  return new Promise((resolve, reject) => {
    fetch('/api/statification/stop', {
      method: 'POST',
      credentials: 'same-origin',
      headers: new Headers({ 'Content-Type': 'application/json' })
    }).then((response) => {
      response.json().then((data) => {
        if (data.success === false) {
          reject(new Error(data.error))
        } else {
          resolve(data)
        }
      })
    }).catch((error) => {
      reject(error)
    })
  })
}

/**
 *
 * @param  {[type]}    action [description]
 * @return {Generator}        [description]
 */
function * stopProcessSaga (action) {
  try {
    // set the loading wheel in the stepper
    yield put(setLoading(true))

    // send the submit request to the server
    const { result, timeout } = yield race({
      result: call(stopProcess),
      timeout: call(delay, 120000)
    })
    if (timeout) { throw new Error('timeout') }
    // catch the HTML error send by the server
  } catch (error) {
    // print a corresponding message to the user
    yield put(pushError(getErrorMessage(error)))
  } finally {
    // remove the loading wheel in the stepper
    yield put(setFormLoading(false))
    yield put(setLoading(false))
    yield put(setDialogOpen(false))
  }
}

/**
 * [commit description]
 * @return {[type]} [description]
 */
function commit () {
  return new Promise((resolve, reject) => {
    fetch('/api/statification/commit', {
      method: 'POST',
      credentials: 'same-origin'
    }).then((response) => {
      response.json().then((data) => {
        if (data.success === false) {
          reject(new Error(data.error))
        } else {
          resolve(data)
        }
      })
    }).catch((error) => {
      reject(error)
    })
  })
}

/**
 * [commitSaga description]
 * @return {Generator} [description]
 */
function * commitSaga () {
  // set the loading wheel in the stepper
  yield put(setLoading(true))
  yield put(setWaitForServer(true))
  // clear all the interval that have been set
  yield put(setClearInterval(true))

  try {
    // send the submit request to the server
    const { result, timeout } = yield race({
      result: call(commit),
      timeout: call(delay, 120000)
    })
    if (timeout) { throw new Error('timeout') }

    // restart setInterval
    yield put(setClearInterval(false))

    // catch the error
    if (!result.success) {
      throw new Error(result.error)
    }

    // show a message to the user to indicate action has been launched
    yield put(pushError(getInfoMessage('start_commit'), 'info'))
  } catch (error) {
    yield put(setLoading(false))
    if (error === 'commit_nothing') {
      yield put(pushError(getErrorMessage(error), 'warn'))
      yield put(setActiveStep(0))
    } else if (error === 'route_access') {
      // print a corresponding message to the user
      yield put(pushError(getErrorMessage(error), 'warn'))
      yield put(setActiveStep(0))
    } else {
      // print a corresponding message to the user
      yield put(pushError(getErrorMessage(error)))
    }
  }
}

/**
 *
 * saveDataSaga is used to push the commit when the statif preview is ok
 * @param  {[type]} commitSha          the commit sha of the statification to publish to production
 */
function pushToProd (commitSha) {
  return new Promise((resolve, reject) => {
    fetch(`/api/statification/pushtoprod?commit=${commitSha}`, {
      method: 'POST',
      credentials: 'same-origin'
    }).then((response) => {
      response.json().then((data) => {
        if (data.success === false) {
          reject(new Error(data.error))
        } else {
          resolve(data)
        }
      })
    }).catch((error) => {
      reject(error)
    })
  })
}

/**
 * [checkStatusProcess description]
 * @return {[type]} [description]
 */
function * pushToProdSaga (action) {
  // set the loading wheel in the stepper
  yield put(setLoading(true))
  yield put(setWaitForServer(true))
  // clear all the interval that have been set
  yield put(setClearInterval(true))

  try {
    // send the submit request to the server
    const { result, timeout } = yield race({
      result: call(pushToProd, action.commitSha),
      timeout: call(delay, 120000)
    })
    if (timeout) { throw new Error('timeout') }

    // restart setInterval
    yield put(setClearInterval(false))

    // if the statification has not been push to prod successfully
    if (!result.success) {
      throw new Error('pushtoprod')
    }

    yield put(pushError(getInfoMessage('start_pushtoprod'), 'info'))

    // catch the HTML error send by the server
  } catch (error) {
    yield put(setLoading(false))
    if (error === 'route_access') {
      // print a corresponding message to the user
      yield put(pushError(getErrorMessage(error), 'warn'))
      yield put(setActiveStep(0))
    } else {
    // print a corresponding message to the user
      yield put(pushError(getErrorMessage(error)))
    }
  }
}

/**
 *
 * saveDataSaga is used to push the commit when the statif preview is ok
 * @param  {[type]} commitSha          the commit sha of the statification to visualize
 */
function visualize (commitSha) {
  return new Promise((resolve, reject) => {
    fetch(`/api/statification/visualize?commit=${commitSha}`, {
      method: 'POST',
      credentials: 'same-origin'
    }).then((response) => {
      response.json().then((data) => {
        if (data.success === false) {
          reject(new Error(data.error))
        } else {
          resolve(data)
        }
      })
    }).catch((error) => {
      reject(error)
    })
  })
}

/**
 * [checkStatusProcess description]
 * @return {[type]} [description]
 */
function * visualizeSaga (action) {
  yield put(setLoading(true))
  yield put(setWaitForServer(true))
  // clear all the interval that have been set
  yield put(setClearInterval(true))

  try {
    // send the submit request to the server
    const { result, timeout } = yield race({
      result: call(visualize, action.commitSha),
      timeout: call(delay, 120000)
    })
    if (timeout) { throw new Error('timeout') }

    // restart setInterval
    yield put(setClearInterval(false))

    // if the statification has not been push to prod successfully
    if (!result.success) {
      yield put(pushError(I18n.t('errors.text.visualize')))
    }

    yield put(pushError(getInfoMessage('start_visualize'), 'info'))

    // catch the HTML error send by the server
  } catch (error) {
    yield put(setLoading(false))
    if (error === 'route_access') {
      // print a corresponding message to the user
      yield put(pushError(getErrorMessage(error), 'warn'))
      yield put(setActiveStep(0))
    } else {
    // print a corresponding message to the user
      yield put(pushError(getErrorMessage(error)))
    }
  }
}

/**
 *
 * [checkLogCurrentStatification description]
 * @return {[type]} [description]
 */
function checkLogCurrentStatification () {
  return new Promise((resolve, reject) => {
    fetch('/api/statification/current', {
      method: 'POST',
      credentials: 'same-origin'
    }).then((response) => {
      // get json from response
      response.json().then((data) => {
        if (data.success === false) {
          reject(new Error(data.error))
        } else {
          resolve(data)
        }
      })
    }).catch((error) => {
      reject(error)
    })
  })
}

function * checkLogCurrentStatificationSaga () {
  try {
    // send the submit request to the server
    const { result, timeout } = yield race({
      result: call(checkLogCurrentStatification),
      timeout: call(delay, 20000)
    })
    if (timeout) { throw new Error('timeout') }

    // limit of the number of error accepted
    if (result && (result.html_errors.length > 500 || result.scrapy_errors.length > 500)) {
      // if there is an array of errors type mime, we set the errors in the list associated
      if (result.errors_type_mime !== undefined) {
        yield put(setListErrorErrorsTypeMime(result.errors_type_mime))
      }

      // if there is an array of scrapy erros, we set the errors in the list associated
      if (result.scrapy_errors !== undefined) {
        yield put(setListErrorScrapyErrors(result.scrapy_errors))
      }

      // if there is an array of html errors, we set the errors in the list associated
      if (result.html_errors !== undefined) {
        yield put(setListErrorHtmlErrors(result.html_errors))
      }

      // if there is an array of scanned files, we set the errors in the list associated
      if (result.scanned_files !== undefined) {
        yield put(setListErrorScannedFiles(result.scanned_files))
      }

      // if there is an array of external links, we set the errors in the list associated
      if (result.external_links !== undefined) {
        yield put(setListErrorExternalLinks(result.external_links))
      }

      // if there is an array of historic, we set the errors in the list associated
      if (result.statification_historics !== undefined) {
        yield put(setListErrorStatificationHistorics(result.statification_historics))
      }
    }
    // catch the HTML error send by the server
  } catch (error) {
    // print a corresponding message to the user
    yield put(pushError(getErrorMessage(error)))
  } finally {
    // set next step (Préliser)
    yield put(setActiveStep(1))
    yield put(setLoading(false))
  }
}

/**
 * Define the SAGAs
 * @return {Generator} [description]
 */
function * watchStatificationsSagas () {
  yield takeEvery('SAGA_STATIFICATION_SUBMIT_FORM', submitFormSaga)
  yield takeEvery('SAGA_STATIFICATION_STOP_PROCESS', stopProcessSaga)
  yield takeEvery('SAGA_STATIFICATION_LOAD_DATA', loadDataSaga)
  yield takeEvery('SAGA_STATIFICATION_CHECK_STATUS', checkStatusProcessSaga)
  yield takeEvery('SAGA_STATIFICATION_COMMIT', commitSaga)
  yield takeEvery('SAGA_STATIFICATION_PUSH_TO_PROD', pushToProdSaga)
  yield takeEvery('SAGA_STATIFICATION_VISUALIZE', visualizeSaga)
  yield takeEvery('SAGA_STATIFICATION_CHECK_CURRENT_LOG', checkLogCurrentStatificationSaga)
}

export default watchStatificationsSagas
