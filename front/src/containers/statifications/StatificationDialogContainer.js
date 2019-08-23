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
import { setDialogOpen } from '../../actions/dialog'
import StatificationDialog from '../../components/statifications/StatificationDialog'
import { statificationsStopProcess } from '../../actions/sagas'
import { setActiveStep, setUrl, setStatificationIsBeingStopped } from '../../actions/statifications'

const mapStateToProps = (state, props) => ({
  open: state.dialog.get('open'),
  title: state.dialog.get('title'),
  text: state.dialog.get('text'),
  typeAction: state.dialog.get('typeAction')
})

const mapDispatchToProps = (dispatch, props) => ({
  stopProcess: () => {
    dispatch(statificationsStopProcess())
  },
  setActiveStep: (step) => {
    dispatch(setActiveStep(step))
  },
  openDialog: (open) => {
    dispatch(setDialogOpen(open))
  },
  setIsBeingStopped: (isBeingStopped) => {
    dispatch(setStatificationIsBeingStopped(isBeingStopped))
  },
  setAndPutUrl: (url) => {
    dispatch(setUrl(url))
    dispatch(push(url))
  }
})

const StatificationDialogContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(StatificationDialog)

export default StatificationDialogContainer
