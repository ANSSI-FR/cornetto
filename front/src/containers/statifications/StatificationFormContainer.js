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
import { initialize, reset, submit } from 'redux-form/immutable'

import StatificationForm from '../../components/statifications/StatificationForm'
import { newForm } from '../../actions/statifications'
import { setDialogOpen, setDialogTitle, setDialogText, setDialogTypeAction } from '../../actions/dialog'
import { statificationsSubmitForm, statificationsCheckStatus } from '../../actions/sagas'

const mapStateToProps = (state, props) => ({
  data: state.statifications.get('form', null),
  initialValues: state.statifications.getIn(['form', 'data']),
  optionsNative: state.options.get('native'),
  optionsMaterial: state.options.get('material'),
  activeStep: state.statifications.get('activeStep', 0),
  statificationRunning: state.statifications.get('statificationRunning'),
  statificationProgress: state.statifications.get('statificationProgress'),
  statificationsTotalPages: state.statifications.get('statificationsTotalPages'),
  isBeingStopped: state.statifications.get('statificationBeingStopped'),
  url: state.statifications.get('url'),
  loading: state.statifications.get('loading'),
  waitForServer: state.statifications.get('waitForServer')
})

const mapDispatchToProps = (dispatch, props) => ({
  resetForm: () => {
    dispatch(reset(props.form))
  },

  submitForm: () => {
    dispatch(submit(props.form))
  },

  checkStatus: (activeStep, waitForServer) => {
    dispatch(statificationsCheckStatus(activeStep, waitForServer))
  },

  send: (data) => {
    dispatch(statificationsSubmitForm(data, props.form))
  },

  reinitialize: (form, data, fields) => {
    dispatch(initialize(form, data, fields))
  },

  clearForm: () => {
    dispatch(newForm())
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
  }
})

const StatificationFormContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(StatificationForm)

export default StatificationFormContainer
