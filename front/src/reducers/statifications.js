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

/**
 * Initializer for the form attribute of statifications reducer
 * @type {Object}
 */
const initForm = {
  data: Immutable.Map(),
  errors: Immutable.Map(),
  loading: false
}

/**
 * Initializer for the list_info attribute of statifications reducer
 * @type {Object}
 */
const initListInfo = {
  errors_type_mime: Immutable.List(),
  errors_scrapy: Immutable.List(),
  errors_html: Immutable.List(),
  scanned_files: Immutable.List(),
  external_links: Immutable.List(),
  historic: Immutable.List(),
  nb_errors_type_mime: 0,
  nb_errors_scrapy: 0,
  nb_errors_html: 0,
  nb_scanned_files: 0,
  nb_external_links: 0,
  nb_historic: 0,
  loading: false
}

/**
 * Initializer for the statifications reducer :
 * Define the attributes of the statification
 * @type {Object}
 */
const init = {
  // datas used to manage the statification form
  form: Immutable.Map(initForm),

  // datas used to manage the list of information of a statification
  list_info: Immutable.Map(initListInfo),

  // datas used to manage the log when a statification has started and got errors
  list_info_error: Immutable.Map(initListInfo),

  // datas used to manage the list of statification
  list: Immutable.List(),
  limit: 10,
  skip: 0,
  count: 0,
  current: '-1',

  // data used for the application
  loading: false,
  waitForServer: false,
  clearInterval: false,
  url: '/create',
  activeStep: 0,
  commitSha: '',
  activeAccordeon: '',

  // datas used to know the state of the statification process
  statificationRunning: false,
  statificationBeingStopped: false,
  statificationProgress: 0,
  statificationTotalPages: 0
}

/**
 * Define the behaviour of the reducer for each actions :
 * Each action will modify the global state by affecting new data to the state attribute
 * @param  {Object} [state=Immutable.Map(init)] - the current global state, initialized with init if not set
 * @param  {Object} action                      - the action that was called (contain the action type and data to treat)
 * @return {Object}                             - return the new state
 */
const statifications = (state = Immutable.Map(init), action) => {
  let nbScannedFiles = 0
  // for each case the reducer treat the data and change the state
  switch (action.type) {
    /**
     * Define route to modify the state for attributes concerning the statifications
     */
    case 'STATIFICATION_SET_ACTIVESTEP':
      return state.set('activeStep', action.activeStep)
    case 'STATIFICATION_SET_COMMIT_SHA':
      return state.set('commitSha', action.commitSha)
    case 'STATIFICATION_SET_LOADING':
      return state.set('loading', action.loading)
    case 'STATIFICATION_SET_WAITFORSERVER':
      return state.set('waitForServer', action.waitForServer)
    case 'STATIFICATION_SET_URL':
      return state.set('url', action.url)
    case 'STATIFICATION_CLEAR_INTERVAL':
      return state.set('clearInterval', action.clearInterval)

    /**
     * Define route to modify the state for attributes concerning the statifications form
     */
    case 'STATIFICATION_SET_FORM_DATA':
      return state.setIn(['form', 'data'], Immutable.Map(action.data))
        .setIn(['form', 'loading'], false)
    case 'STATIFICATION_SET_FORM_ERRORS':
      return state.setIn(['form', 'errors'], Immutable.Map(action.errors))
        .setIn(['form', 'loading'], false)
    case 'STATIFICATION_SET_FORM_LOADING':
      return state.setIn(['form', 'loading'], action.loading)
    case 'STATIFICATION_NEW_FORM':
      return state.set('form', Immutable.Map(initForm))

    /**
     * Define route to modify the state for attributes concerning the statifications process
     */
    case 'STATIFICATION_SET_STATIFICATION_RUNNING':
      return state.set('statificationRunning', action.running)
    case 'STATIFICATION_SET_STATIFICATION_BEING_STOPPED':
      return state.set('statificationBeingStopped', action.isBeingStopped)
    case 'STATIFICATION_SET_STATIFICATION_PROGRESS':
      return state.set('statificationProgress', action.currentNbItemCrawled).set('statificationsTotalPages', action.nbItemToCrawl)
    /**
     *  Define route to modify the state for attributes concerning the list of statifications
     */
    case 'STATIFICATION_SET_LIST':
      return state.set('list', Immutable.List(action.list))
    case 'STATIFICATION_PUSH_LIST':
      return state.set('list', state.get('list').concat(action.list))
    case 'STATIFICATION_CLEAR_LIST':
      return state.set('list', Immutable.List())
    case 'STATIFICATION_SET_COUNT':
      return state.set('count', action.count)
    case 'STATIFICATION_SET_LIMIT':
      return state.set('limit', action.limit)
    case 'STATIFICATION_SET_SKIP':
      return state.set('skip', action.skip)
    case 'STATIFICATION_SET_CURRENT':
      return state.set('current', action.current)
    case 'STATIFICATION_SET_ACTIVEACCORDEON':
      return state.set('activeAccordeon', action.activeAccordeon)

    /**
     *  Define route to modify the state for attributes concerning the list of informations of a statifications
     */
    case 'STATIFICATION_SET_LIST_INFO_LOADING':
      return state.setIn(['list_info', 'loading'], action.loading)
    case 'STATIFICATION_SET_LIST_INFO_ERROR_TYPE_MIME':
      return state.setIn(['list_info', 'errors_type_mime'], Immutable.List(action.data))
        .setIn(['list_info', 'loading'], false).setIn(['list_info', 'nb_errors_type_mime'], action.data.length)
    case 'STATIFICATION_SET_LIST_INFO_ERROR_SCRAPY':
      return state.setIn(['list_info', 'errors_scrapy'], Immutable.List(action.data))
        .setIn(['list_info', 'loading'], false).setIn(['list_info', 'nb_errors_scrapy'], action.data.length)
    case 'STATIFICATION_SET_LIST_INFO_ERROR_HTML':
      return state.setIn(['list_info', 'errors_html'], Immutable.List(action.data))
        .setIn(['list_info', 'loading'], false).setIn(['list_info', 'nb_errors_html'], action.data.length)
    case 'STATIFICATION_SET_LIST_INFO_SCANNED_FILE':
      for (let i = 0; i < action.data.length; i += 1) {
        nbScannedFiles += action.data[i].nb
      }
      return state.setIn(['list_info', 'scanned_files'], Immutable.List(action.data))
        .setIn(['list_info', 'loading'], false).setIn(['list_info', 'nb_scanned_files'], nbScannedFiles)
    case 'STATIFICATION_SET_LIST_INFO_EXTERNAL_LINK':
      return state.setIn(['list_info', 'external_links'], Immutable.List(action.data))
        .setIn(['list_info', 'loading'], false).setIn(['list_info', 'nb_external_links'], action.data.length)
    case 'STATIFICATION_SET_LIST_INFO_HISTORIC':
      return state.setIn(['list_info', 'historic'], Immutable.List(action.data))
        .setIn(['list_info', 'loading'], false)

    /**
     * Define route to modify the state for attributes concerning the list of informations of the just statified statifications that have errors
     */
    case 'STATIFICATION_SET_LIST_INFO_ERROR_LOADING':
      return state.setIn(['list_info_error', 'loading'], action.loading)
    case 'STATIFICATION_SET_LIST_INFO_ERROR_ERROR_TYPE_MIME':
      return state.setIn(['list_info_error', 'errors_type_mime'], Immutable.List(action.data))
        .setIn(['list_info_error', 'loading'], false).setIn(['list_info_error', 'nb_errors_type_mime'], action.data.length)
    case 'STATIFICATION_SET_LIST_INFO_ERROR_ERROR_SCRAPY':
      return state.setIn(['list_info_error', 'errors_scrapy'], Immutable.List(action.data))
        .setIn(['list_info_error', 'loading'], false).setIn(['list_info_error', 'nb_errors_scrapy'], action.data.length)
    case 'STATIFICATION_SET_LIST_INFO_ERROR_ERROR_HTML':
      return state.setIn(['list_info_error', 'errors_html'], Immutable.List(action.data))
        .setIn(['list_info_error', 'loading'], false).setIn(['list_info_error', 'nb_errors_html'], action.data.length)
    case 'STATIFICATION_SET_LIST_INFO_ERROR_SCANNED_FILE':
      for (let i = 0; i < action.data.length; i += 1) {
        nbScannedFiles += action.data[i].nb
      }
      return state.setIn(['list_info_error', 'scanned_files'], Immutable.List(action.data))
        .setIn(['list_info_error', 'loading'], false).setIn(['list_info_error', 'nb_scanned_files'], nbScannedFiles)
    case 'STATIFICATION_SET_LIST_INFO_ERROR_EXTERNAL_LINK':
      return state.setIn(['list_info_error', 'external_links'], Immutable.List(action.data))
        .setIn(['list_info_error', 'loading'], false).setIn(['list_info_error', 'nb_external_links'], action.data.length)
    case 'STATIFICATION_SET_LIST_INFO_ERROR_HISTORIC':
      return state.setIn(['list_info_error', 'historic'], Immutable.List(action.data))
        .setIn(['list_info_error', 'loading'], false)
    case 'STATIFICATION_CLEAR_LIST_INFO_ERROR':
      return state.set('list_info_error', Immutable.Map(initListInfo))

    /**
     * Default case
     */
    default:
      return state
  }
}

export default statifications
