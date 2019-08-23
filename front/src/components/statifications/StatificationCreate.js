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
import { Button, Step, Stepper, StepLabel } from '@material-ui/core'
import { I18n } from 'react-redux-i18n'

import StatificationFormContainer
  from '../../containers/statifications/StatificationFormContainer'

const NBSTEPS = 5

class StatificationCreate extends React.PureComponent {
  constructor (props) {
    super(props)
    this.handleBack = this.handleBack.bind(this)
    this.handleNext = this.handleNext.bind(this)
    this.onCancelClick = this.onCancelClick.bind(this)
    this.onNewClick = this.onNewClick.bind(this)
    this.doPushToProd = this.doPushToProd.bind(this)
    this.stepClass = this.stepClass.bind(this)
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
   * This method send the user to step 0 so he can create a new statification
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  onNewClick (e) {
    // prevent default behaviour on event
    e.preventDefault()

    // clear the Form
    this.props.clearForm()

    // send user to step 0
    this.props.setActiveStep(0)
  }

  // sent to next step
  handleNext () {
    if (this.props.activeStep < NBSTEPS - 1) {
      this.props.setActiveStep(this.props.activeStep + 1)
    }
  }

  // send to previous step
  handleBack () {
    if (this.props.activeStep > 0) {
      this.props.setActiveStep(this.props.activeStep - 1)
    }
  }

  doPushToProd () {
    this.props.pushToProd(this.props.currentStatificationCommitSha)

    // clear the Form
    this.props.clearForm()
  }

  /**
   * This method return the correct class for the step depending
   * on the activeStep
   * @param  {number} step the step that will receive the css class properties
   * @return {string}      a string containing the css class
   */
  stepClass (step) {
    if (step === 1 || step <= this.props.activeStep) {
      if (step <= this.props.activeStep - 1) {
        return 'step step-validate'
      }

      return 'step step-active'
    }

    return 'step'
  }

  render () {
    return (
      <div className='stepper-wrapper'>
        <Stepper className='stepper' alternativeLabel activeStep={this.props.activeStep}>
          <Step key='step1' className={this.stepClass(1)}>
            <StepLabel>{I18n.t('ui.steps.create')} </StepLabel>
          </Step>
          <Step key='step2' className={this.stepClass(2)}>
            <StepLabel>{I18n.t('ui.steps.preview')}</StepLabel>
          </Step>
          <Step key='step3' className={this.stepClass(3)}>
            <StepLabel>{I18n.t('ui.steps.save')}</StepLabel>
          </Step>
          <Step key='step4' className={this.stepClass(4)}>
            <StepLabel>{I18n.t('ui.steps.publish')}</StepLabel>
          </Step>
        </Stepper>
        {this.props.activeStep === 0 &&
        <div className='step-block'>
          <StatificationFormContainer form='statification_form' id={-1} />
        </div>
        }
        {this.props.activeStep === 1 &&
          <div className='step-block'>
            <p className='text'>
              {I18n.t('steps.step1')}
            </p>
            <div className='form-buttons'>
              <Button variant='raised' href={I18n.t('url.site_static')} target='_blank' onClick={this.handleNext} className='button-next' disabled={this.props.loading || this.props.pristine}>{I18n.t('ui.steps.preview')}</Button>
              <Button onClick={this.onCancelClick} disabled={this.props.loading || this.props.pristine} className='button-cancel'>{I18n.t('ui.steps.cancel')}</Button>
            </div>
          </div>
        }
        {this.props.activeStep === 2 &&
          <div className='step-block'>
            <p className='text'>
              {I18n.t('steps.step2')}
            </p>
            <div className='form-buttons'>
              <Button variant='raised' onClick={this.props.commit} className='button-next' disabled={this.props.loading || this.props.pristine}>{I18n.t('ui.steps.save')}</Button>
              <Button onClick={this.onCancelClick} disabled={this.props.loading || this.props.pristine} className='button-cancel'>{I18n.t('ui.steps.cancel')}</Button>
            </div>
          </div>
        }
        {this.props.activeStep === 3 &&
          <div className='step-block'>
            <p className='text'>
              {I18n.t('steps.step3')}
            </p>
            <div className='form-buttons'>
              <Button variant='raised' onClick={this.doPushToProd} className='button-next' disabled={this.props.loading || this.props.pristine}>{I18n.t('ui.steps.publish')}</Button>
              <Button onClick={this.onNewClick} disabled={this.props.loading || this.props.pristine} className='button-cancel restart'>{I18n.t('ui.steps.new')}</Button>
            </div>
          </div>
        }
      </div>
    )
  }
}

/**
 * Define the types of properties for the component
 * @type {Object}
 */
StatificationCreate.propTypes = {
  setActiveStep: PropTypes.func,
  activeStep: PropTypes.number,
  pushToProd: PropTypes.func,
  showDialog: PropTypes.func,
  setDialogTitle: PropTypes.func,
  setDialogText: PropTypes.func,
  setDialogTypeAction: PropTypes.func,
  clearForm: PropTypes.func,
  commit: PropTypes.func,
  currentStatificationCommitSha: PropTypes.string,
  loading: PropTypes.bool,
  pristine: PropTypes.bool
}

/**
 * Define default value for the component
 * @type {Object}
 */
StatificationCreate.defaultProps = {
  setActiveStep: undefined,
  activeStep: 0,
  showDialog: undefined,
  setDialogTitle: undefined,
  setDialogText: undefined,
  setDialogTypeAction: undefined,
  clearForm: undefined,
  pushToProd: undefined,
  commit: undefined,
  currentStatificationCommitSha: '',
  loading: false,
  pristine: false
}

export default StatificationCreate
