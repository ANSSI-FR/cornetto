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
/**
 * This file definish actions methods that will call specifics reducer's route with the needed parameters
 */

/**
 * The following methods define actions that manipulate application steps datas
 */

/**
 * Call the route STATIFICATION_SET_ACTIVESTEP for the reducer Statifications
 * This route set the step in the application stepper
 * @param {number} activeStep the new step to set
 */
export const setActiveStep = activeStep => ({
  type: 'STATIFICATION_SET_ACTIVESTEP',
  activeStep
})

/**
 * Call the route STATIFICATION_SET_COMMIT_SHA for the reducers Statifications
 * This set the commit sha of the last statification, it will be use when the user will be on the step 3 to push to prod
 * @param {string} commitSha the commit sha to set
 */
export const setCommitSha = commitSha => ({
  type: 'STATIFICATION_SET_COMMIT_SHA',
  commitSha
})

/**
 * Call the route STATIFICATION_SET_LOADING for the reducers Statifications
 * Set the loading status, that will lock button and show a wheel of the stepper and of the list of statifications
 * @param {boolean} [loading=false] set the loading status
 */
export const setLoading = (loading = false) => ({
  type: 'STATIFICATION_SET_LOADING',
  loading
})

/**
 * Call the route STATIFICATION_CLEAR_INTERVAL for the reducers Statifications
 * Tel if clear interval need to be done when App.js receive props
 * @param {boolean} [loading=false] set the loading status
 */
export const setClearInterval = (clearInterval = false) => ({
  type: 'STATIFICATION_CLEAR_INTERVAL',
  clearInterval
})

/**
 * Call the route STATIFICATION_SET_WAITFORSERVER for the reducers Statifications
 * Set that the application is waiting for the serveur to answer something after an operation is done
 * @param {boolean} [waitForServer=false] set the loading status
 */
export const setWaitForServer = (waitForServer = false) => ({
  type: 'STATIFICATION_SET_WAITFORSERVER',
  waitForServer
})

/**
 * Call the route STATIFICATION_SET_URL for the menu bar
 * Set the url to create by default
 */
export const setUrl = (url = '/create') => ({
  type: 'STATIFICATION_SET_URL',
  url
})

/**
 * The following methods define actions that manipulate the statification form datas
 */

/**
 * Call the route STATIFICATION_SET_FORM_DATA for the reducers Statifications
 * Set the form data, it will be use to fill the field of the form
 * @param {Object} data the data of the form
 */
export const setFormData = data => ({
  type: 'STATIFICATION_SET_FORM_DATA',
  data
})

/**
 * Call the route STATIFICATION_SET_FORM_ERRORS for the reducers Statifications
 * Set the form errors
 * @param {string} errors the errors to set
 */
export const setFormErrors = errors => ({
  type: 'STATIFICATION_SET_FORM_ERRORS',
  errors
})

/**
 * Call the route STATIFICATION_SET_FORM_LOADING for the reducers Statifications
 * Set the loading status, that will lock button and show a wheel in the form
 * @param {boolean} [loading=false] the loading status
 */
export const setFormLoading = (loading = false) => ({
  type: 'STATIFICATION_SET_FORM_LOADING',
  loading
})

/**
 * Call the route STATIFICATION_NEW_FORM for the reducers Statifications
 */
export const newForm = () => ({
  type: 'STATIFICATION_NEW_FORM'
})

/**
 * The following methods define actions that manipulate datas about the statification process
 */

/**
 * Call the route STATIFICATION_SET_STATIFICATION_RUNNING for the reducers Statifications
 * @param {boolean} running [description]
 */
export const setStatificationRunning = running => ({
  type: 'STATIFICATION_SET_STATIFICATION_RUNNING',
  running
})

/**
 * Call the route STATIFICATION_SET_STATIFICATION_RUNNING for the reducers Statifications
 * @param {boolean} running [description]
 */
export const setStatificationIsBeingStopped = isBeingStopped => ({
  type: 'STATIFICATION_SET_STATIFICATION_BEING_STOPPED',
  isBeingStopped
})

/**
 * Call the route STATIFICATION_SET_STATIFICATION_PROGRESS for the reducers Statifications
 * @param {number} currentNbItemCrawled [description]
 * @param {number} nbItemToCrawl        [description]
 */
export const setStatificationProgress = (currentNbItemCrawled, nbItemToCrawl) => ({
  type: 'STATIFICATION_SET_STATIFICATION_PROGRESS',
  currentNbItemCrawled,
  nbItemToCrawl
})

/**
 * The following methods define actions that manipulate the datas about the statifications list
 */

/**
 * Call the route STATIFICATION_SET_LIST for the reducers Statifications
 * @param {Array} list [description]
 */
export const setList = list => ({
  type: 'STATIFICATION_SET_LIST',
  list
})

/**
 * Call the route STATIFICATION_PUSH_LIST for the reducers Statifications
 * @param  {Array} list [description]
 */
export const pushList = list => ({
  type: 'STATIFICATION_PUSH_LIST',
  list
})

/**
 * Call the route STATIFICATION_CLEAR_LIST for the reducers Statifications
 * @param  {Array} list [description]
 */
export const clearList = () => ({
  type: 'STATIFICATION_CLEAR_LIST'
})

/**
 * Call the route STATIFICATION_SET_COUNT for the reducers Statifications
 * @param {number} count [description]
 */
export const setCount = count => ({
  type: 'STATIFICATION_SET_COUNT',
  count
})

/**
 * Call the route STATIFICATION_SET_LIMIT for the reducers Statifications
 * @param {number} limit [description]
 */
export const setLimit = limit => ({
  type: 'STATIFICATION_SET_LIMIT',
  limit
})

/**
 * Call the route STATIFICATION_SET_SKIP for the reducers Statifications
 * @param {number} skip [description]
 */
export const setSkip = skip => ({
  type: 'STATIFICATION_SET_SKIP',
  skip
})

/**
 * Call the route STATIFICATION_SET_CURRENT for the reducers Statifications
 * @param {number} current [description]
 */
export const setCurrent = current => ({
  type: 'STATIFICATION_SET_CURRENT',
  current
})

/**
 * The following methods define actions that manipulate the data for the list of information about a statification
 */

/**
 * Call the route STATIFICATION_SET_LIST_INFO_LOADING for the reducers Statifications
 * Set the loading status, that will lock button and show a wheel in the list of informations
 * @param {Boolean} [loading=false] the loading status
 */
export const setListInfoLoading = (loading = false) => ({
  type: 'STATIFICATION_SET_LIST_INFO_LOADING',
  loading
})

/**
 * [setListErrorsTypeMime description]
 * @param {Array} [data=[]] [description]
 */
export const setListErrorsTypeMime = (data = []) => ({
  type: 'STATIFICATION_SET_LIST_INFO_ERROR_TYPE_MIME',
  data
})

/**
 * Call the route STATIFICATION_SET_LIST_INFO_ERROR_SCRAPY for the reducers Statifications
 * Set the list of Scrapy Errors
 * @param {Array} [data=[]] the list of Scrapy Errors
 */
export const setListScrapyErrors = (data = []) => ({
  type: 'STATIFICATION_SET_LIST_INFO_ERROR_SCRAPY',
  data
})

/**
 * Call the route STATIFICATION_SET_LIST_INFO_ERROR_HTML for the reducers Statifications
 * Set the list of HTML errors
 * @param {Array} [data=[]] the list of HTML errors
 */
export const setListHtmlErrors = (data = []) => ({
  type: 'STATIFICATION_SET_LIST_INFO_ERROR_HTML',
  data
})

/**
 * [setListScannedFiles description]
 * @param {Array} [data=[]] [description]
 */
export const setListScannedFiles = (data = []) => ({
  type: 'STATIFICATION_SET_LIST_INFO_SCANNED_FILE',
  data
})

/**
 * Call the route STATIFICATION_SET_LIST_INFO_EXTERNAL_LINK for the reducers Statifications
 * Set the list of external links
 * @param {Array} [data=[]] the list of external links
 */
export const setListExternalLinks = (data = []) => ({
  type: 'STATIFICATION_SET_LIST_INFO_EXTERNAL_LINK',
  data
})

/**
 * Call the route STATIFICATION_SET_LIST_INFO_HISTORIC for the reducers Statifications
 * Set the list of Statification Historique
 * @param {Array} [data=[]] the list of statifications historic
 */
export const setListStatificationHistorics = (data = []) => ({
  type: 'STATIFICATION_SET_LIST_INFO_HISTORIC',
  data
})

/**
 * The following methods define actions that manipulate the data for the list of information about a statification
 */

/**
 * Call the route STATIFICATION_SET_LIST_INFO_LOADING for the reducers Statifications
 * Set the loading status, that will lock button and show a wheel in the list of informations
 * @param {Boolean} [loading=false] the loading status
 */
export const setListInfoErrorLoading = (loading = false) => ({
  type: 'STATIFICATION_SET_LIST_INFO_ERROR_LOADING',
  loading
})

/**
 * [setListErrorsTypeMime description]
 * @param {Array} [data=[]] [description]
 */
export const setListErrorErrorsTypeMime = (data = []) => ({
  type: 'STATIFICATION_SET_LIST_INFO_ERROR_ERROR_TYPE_MIME',
  data
})

/**
 * Call the route STATIFICATION_SET_LIST_INFO_ERROR_SCRAPY for the reducers Statifications
 * Set the list of Scrapy Errors
 * @param {Array} [data=[]] the list of Scrapy Errors
 */
export const setListErrorScrapyErrors = (data = []) => ({
  type: 'STATIFICATION_SET_LIST_INFO_ERROR_ERROR_SCRAPY',
  data
})

/**
 * Call the route STATIFICATION_SET_LIST_INFO_ERROR_HTML for the reducers Statifications
 * Set the list of HTML errors
 * @param {Array} [data=[]] the list of HTML errors
 */
export const setListErrorHtmlErrors = (data = []) => ({
  type: 'STATIFICATION_SET_LIST_INFO_ERROR_ERROR_HTML',
  data
})

/**
 * [setListScannedFiles description]
 * @param {Array} [data=[]] [description]
 */
export const setListErrorScannedFiles = (data = []) => ({
  type: 'STATIFICATION_SET_LIST_INFO_ERROR_SCANNED_FILE',
  data
})

/**
 * Call the route STATIFICATION_SET_LIST_INFO_EXTERNAL_LINK for the reducers Statifications
 * Set the list of external links
 * @param {Array} [data=[]] the list of external links
 */
export const setListErrorExternalLinks = (data = []) => ({
  type: 'STATIFICATION_SET_LIST_INFO_ERROR_EXTERNAL_LINK',
  data
})

/**
 * Call the route STATIFICATION_SET_LIST_INFO_HISTORIC for the reducers Statifications
 * Set the list of Statification Historique
 * @param {Array} [data=[]] the list of statifications historic
 */
export const setListErrorStatificationHistorics = (data = []) => ({
  type: 'STATIFICATION_SET_LIST_INFO_ERROR_HISTORIC',
  data
})

/**
 * Call the route STATIFICATION_SET_LIST_INFO_ERROR for the reducers Statifications
 */
export const clearListErrorInfo = () => ({
  type: 'STATIFICATION_CLEAR_LIST_INFO_ERROR'
})

/**
 * Call the route STATIFICATION_SET_ACTIVECOLLAPSE for the reducer Statifications
 * This route set the open status for collapse in the tables in view list and view popup
 * @param {string} activeAccordeon the new status to set
 */
export const setActiveAccordeon = activeAccordeon => ({
  type: 'STATIFICATION_SET_ACTIVEACCORDEON',
  activeAccordeon
})
