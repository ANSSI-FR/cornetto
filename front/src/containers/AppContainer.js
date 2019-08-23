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
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import App from '../components/App'
import { setUrl, setStatificationIsBeingStopped } from '../actions/statifications'
import { setDialogOpen, setDialogTitle, setDialogText, setDialogTypeAction } from '../actions/dialog'
import { statificationsCheckStatus } from '../actions/sagas'

/**
 * This method is used to get the tab corresponding to the url passed in parameter
 * @param  {string} url the url of the current tab
 * @return {number}       the number corresponding to the tab
 */
const getTab = (url) => {
  // if the url is empty then set the default tab
  if (!url) { return 0 }

  if (url.startsWith('/create')) { return 0 }

  if (url.startsWith('/list')) { return 1 }

  return 0
}

/**
 * map state properties to component props,
 * and suscribe in the same time to state properties modification
 * @param  {object} state the state of the application
 * @param  {object} props the properties of the component
 * @return {object}       the new properties of the component
 */
const mapStateToProps = (state, props) => ({
  tab: getTab(state.router.location.pathname),
  url: state.statifications.get('url'),
  activeStep: state.statifications.get('activeStep'),
  statificationRunning: state.statifications.get('statificationRunning'),
  isBeingStopped: state.statifications.get('statificationBeingStopped'),
  loading: state.statifications.get('loading'),
  clearInterval: state.statifications.get('clearInterval'),
  waitForServer: state.statifications.get('waitForServer'),
  islistErrorSet: (
    state.statifications.getIn(['list_info_error', 'nb_errors_html']) ||
    state.statifications.getIn(['list_info_error', 'nb_errors_scrapy']) ||
    state.statifications.getIn(['list_info_error', 'nb_errors_type_mime']) ||
    state.statifications.getIn(['list_info_error', 'nb_external_links']) ||
    state.statifications.getIn(['list_info_error', 'nb_scanned_files'])
  )
})

/**
 * map dispatch action to component properties
 * @param  {[type]} dispatch [description]
 * @param  {[type]} props    [description]
 * @return {[type]}          [description]
 */
const mapDispatchToProps = (dispatch, props) => ({
  tabChange: (tab) => {
    // do a url change when the tab is changed
    switch (tab) {
      case 0:
        dispatch(setUrl('/create'))
        dispatch(push('/create/'))
        break
      case 1:
        dispatch(setUrl('/list'))
        dispatch(push('/list/'))
        break
      default:
        dispatch(push('/'))
    }
  },
  // this method call the saga to check the status of the statification process
  checkStatus: (step, loading) => {
    dispatch(statificationsCheckStatus(step, loading))
  },
  showDialog: (isOpen) => {
    dispatch(setDialogOpen(isOpen))
  },
  setDialogTitle: (title) => {
    dispatch(setDialogTitle(title))
  },
  setDialogText: (text) => {
    dispatch(setDialogText(text))
  },
  setDialogTypeAction: (typeAction) => {
    dispatch(setDialogTypeAction(typeAction))
  },
  setIsBeingStopped: (isBeingStopped) => {
    dispatch(setStatificationIsBeingStopped(isBeingStopped))
  }
})

/**
 * [AppContainer description]
 * @type {[type]}
 */
const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App)

export default AppContainer
