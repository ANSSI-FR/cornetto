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
import React from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  withMobileDialog
} from '@material-ui/core'
import { I18n } from 'react-redux-i18n'
import { clearAllSetInterval } from '../../utils'

class StatificationDialog extends React.Component {
  constructor (props) {
    super(props)

    this.handleClose = this.handleClose.bind(this)
    this.handleCloseConfirm = this.handleCloseConfirm.bind(this)
  }

  handleClose () {
    this.props.openDialog(false)
  }

  /**
   * This method handle the behaviour on confirm
   * If the user click on the confirm button then this method will be called,
   * the behaviour behind it will depend on the property 'typeAction' of the dialog.
   * The action is choosen with a switch case, typeAction is a string and should be filled
   * with one string corresponding to a specific case.
   */
  handleCloseConfirm () {
    this.handleClose()
    switch (this.props.typeAction) {
      // case when the user has click on list tab during the statification step
      case 'change_tab':
        // set the status isBeingStopped to true to signal to the user that the process is being stopped
        this.props.setIsBeingStopped(true)
        // stop the process and delete the new statification
        this.props.stopProcess()
        // do the tab change
        this.props.setAndPutUrl('/list/')
        // clear all the interval that have been set
        clearAllSetInterval()
        // clear all the interval that have been set and restart
        setTimeout(this.props.setActiveStep(0), 7000)
        break
      // case when the user has click on cancel button during the statification step
      case 'cancel_step':
        // set the status isBeingStopped to true to signal to the user that the process is being stopped
        this.props.setIsBeingStopped(true)
        // stop the process and delete the new statification
        this.props.stopProcess()
        // send user to step 0
        this.props.setActiveStep(0)
        break
      case 'redirect_process_running':
        // change to tab create
        this.props.setAndPutUrl('/create')
        break
      // default case that shouldn't be used,
      // this case do nothing but is here just in case someone forgot to set the 'typeAction' property
      default:
        break
    }
  }

  render () {
    const { fullScreen } = this.props
    return (
      <div>
        <Dialog
          fullScreen={fullScreen}
          open={this.props.open}
          onClose={this.handleClose}
          aria-labelledby='responsive-dialog-title'
          className='dialog'
        >
          <DialogTitle id='responsive-dialog-title'>{this.props.title}</DialogTitle>
          <DialogContent>
            <DialogContentText className='dialog-text'>
              {this.props.text}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            { this.props.typeAction !== 'redirect_process_running' &&
            <Button onClick={this.handleClose} className='button-cancel' autoFocus>
              {I18n.t('ui.buttons.cancel')}
            </Button>
            }
            <Button onClick={this.handleCloseConfirm} className='button-next'>
              {I18n.t('ui.buttons.confirm')}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}

StatificationDialog.propTypes = {
  fullScreen: PropTypes.bool.isRequired,
  text: PropTypes.string,
  title: PropTypes.string,
  typeAction: PropTypes.string,
  openDialog: PropTypes.func,
  setAndPutUrl: PropTypes.func,
  stopProcess: PropTypes.func,
  setActiveStep: PropTypes.func,
  setIsBeingStopped: PropTypes.func,
  open: PropTypes.bool
}

StatificationDialog.defaultProps = {
  open: false,
  typeAction: '',
  text: '',
  title: '',
  openDialog: undefined,
  setAndPutUrl: undefined,
  stopProcess: undefined,
  setActiveStep: undefined,
  setIsBeingStopped: undefined
}

export default withMobileDialog()(StatificationDialog)
