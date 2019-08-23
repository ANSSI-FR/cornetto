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
import Immutable from 'immutable'
import { reduxForm } from 'redux-form/immutable'
import { I18n } from 'react-redux-i18n'
import { CircularProgress, Button, LinearProgress } from '@material-ui/core'
import FormTextInput from '../elements/FormTextInput'

// this global constant is used to indicate the number of step there is in the stepper
const NBSTEPS = 5

const styles = {
  visible: { visibility: 'visible' },
  hidden: { visibility: 'hidden' }
}

/**
 * This method validate the content of the form's fields
 * @param  {Map} values the values of the fields
 * @return {Object}        an object containing the error message for each uncorrectly filled fields
 */
const validateForm = (values) => {
  const errors = {}

  // the regex used to test the designation
  const regexDesignation = /^[\w\u00E0-\u00FC\s-_]{4,50}$/
  if (!values.get('designation')) {
    errors.designation = I18n.t('errors.validation.empty')
  } else if (values.get('designation').length > 50) {
    errors.designation = I18n.t('errors.validation.tooLong')
  } else if (values.get('designation').length < 4) {
    errors.designation = I18n.t('errors.validation.tooShort')
  } else if (!regexDesignation.test(values.get('designation'))) {
    errors.designation = I18n.t('errors.validation.regex')
  }

  return errors
}

/**
 * This method normalize the data entered in the designation field
 * It impeach the user to type more than 50 characters
 * @param  {String} value the value of the field
 * @return {String}       the new value after normalization
 */
const normalizingDesignation = (value) => {
  if (value && value.length >= 51) {
    return value.substr(0, 50)
  }

  return value
}

/**
 * This method submit is call when redux-form submit is called
 * It will trigger the saga to send the form to the server
 * @param  {[type]} data     the data of the form
 * @param  {[type]} dispatch the redux dispatch function
 * @param  {[type]} props    the properties of the component
 */
const submit = (data, dispatch, props) => {
  props.send(data.toJS())
  // check if a statification has been started
  props.checkStatus(props.activeStep, false)
}

/**
 * This component manage the form for the designation and description of the statification
 * Submitting this form will send it to the api and trigger the process of statification
 * This component is also used to show data in read only in the statification page
 * @extends React
 */
class StatificationForm extends React.PureComponent {
  constructor (props) {
    super(props)
    // bind all method to the component
    this.onCancelClick = this.onCancelClick.bind(this)
    this.handleBack = this.handleBack.bind(this)
    this.handleNext = this.handleNext.bind(this)
  }

  componentDidMount () {
    // if the sta
    if (this.props.id === -1) {
      this.props.clearForm()
    }
  }

  componentWillReceiveProps (props) {
    // if the component isn't initialized, initialize it
    if (!props.initialized) { props.initialize(props.initialValues) }

    // if the id change and isn't -1 clear the form
    if (this.props.id !== props.id) {
      if (props.id === -1) { this.props.clearForm() }
    }

    return props
  }

  /**
   * This method will trigger the dialog popup that will ask the user to confirm cancel action
   * if the user confirm, then the statification will be stopped and deleted
   * @param  {[type]} e the event throw on onClick
   */
  onCancelClick (e) {
    // prevent default behaviour on event
    e.preventDefault()

    // setup the dialog and show it to the user
    this.props.setDialogTitle(I18n.t('statification.dialog.cancel_step.title'))
    this.props.setDialogText(I18n.t('statification.dialog.cancel_step.text'))
    this.props.setDialogTypeAction('cancel_step')
    this.props.showDialog(true)
  }

  /**
   * This method pass to the next step
   */
  handleNext () {
    if (this.props.activeStep < NBSTEPS - 1) { this.props.setActiveStep(this.props.activeStep + 1) }
  }

  /**
   * This method pass to the previous step
   */
  handleBack () {
    if (this.props.activeStep > 0) { this.props.setActiveStep(this.props.activeStep - 1) }
  }

  render () {
    // create boolean constant to hide buttons and/or progress bar in different case:
    //
    const runningAndNotBeingStopped = this.props.statificationRunning && !this.props.isBeingStopped
    const runningAndBeingStopped = this.props.statificationRunning && this.props.isBeingStopped
    return (
      <div>
        <div style={this.props.data.get('loading') ? styles.visible : styles.hidden} className='statificationform-loading-parent display'>
          <CircularProgress className='statificationform-loading-child' />
        </div>
        <form onSubmit={this.props.handleSubmit}>
          <div className='statificationform statif-form'>
            <div className='statificationform_header form-header'>
              <FormTextInput form='statification' field='designation' normalize={normalizingDesignation} disabled={this.props.statificationRunning || this.props.disabled} />
              <FormTextInput form='statification' field='description' multiline rowsMax={4} disabled={this.props.statificationRunning || this.props.disabled} />
            </div>
          </div>
          { !this.props.disabled &&
          <div className='statificationform-buttons form-buttons'>
            { !this.props.statificationRunning &&
              <Button variant='raised' type='submit' className='button-next' disabled={this.props.loading || !this.props.valid || this.props.submitting} >{I18n.t('ui.buttons.submit')}</Button>
            }
            { runningAndNotBeingStopped &&
              <LinearProgress
                variant='determinate'
                value={Math.floor((this.props.statificationProgress / this.props.statificationsTotalPages) * 100)}
                className='linearProgress'
              />
            }
            { runningAndBeingStopped &&
              <LinearProgress className='linearProgress' />
            }
            { runningAndNotBeingStopped &&
              <Button variant='raised' onClick={this.onCancelClick} className='button-cancel button-centered' disabled={this.props.isBeingStopped}>{I18n.t('ui.buttons.cancel')}</Button>
            }
          </div>
          }
        </form>
      </div>
    )
  }
}

/**
 * Define the types of properties for the component
 * @type {Object}
 */
StatificationForm.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  statificationsTotalPages: PropTypes.number,
  statificationProgress: PropTypes.number,
  statificationRunning: PropTypes.bool,
  isBeingStopped: PropTypes.bool,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  initialized: PropTypes.bool,
  initialize: PropTypes.func,
  initialValues: PropTypes.oneOfType([PropTypes.instanceOf(Immutable.Map), PropTypes.instanceOf(Object)]),
  clearForm: PropTypes.func,
  handleSubmit: PropTypes.func.isRequired,
  setDialogTitle: PropTypes.func,
  setDialogText: PropTypes.func,
  setDialogTypeAction: PropTypes.func,
  showDialog: PropTypes.func,
  setActiveStep: PropTypes.func,
  activeStep: PropTypes.number,
  data: PropTypes.oneOfType([PropTypes.instanceOf(Immutable.Map), PropTypes.instanceOf(Object)]),
  valid: PropTypes.bool,
  submitting: PropTypes.bool
}

/**
 * Define default value for the component
 * @type {Object}
 */
StatificationForm.defaultProps = {
  id: -1,
  statificationsTotalPages: 0,
  statificationProgress: 0,
  statificationRunning: false,
  isBeingStopped: false,
  loading: false,
  disabled: false,
  initialized: false,
  initialValues: {},
  initialize: undefined,
  clearForm: undefined,
  setActiveStep: undefined,
  setDialogTitle: undefined,
  setDialogText: undefined,
  setDialogTypeAction: undefined,
  showDialog: undefined,
  activeStep: 0,
  data: {},
  valid: false,
  submitting: false
}

const StatificationFormWithReduxForm = reduxForm({
  enableReinitialize: true,
  destroyOnUnmount: false,
  keepDirtyOnReinitialize: false,
  updateUnregisteredFields: true,
  onSubmit: submit,
  validate: validateForm
})(StatificationForm)

export default StatificationFormWithReduxForm
