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
import { Snackbar, Button } from '@material-ui/core'
import Immutable from 'immutable'
import { ThumbUp, Warning, Error } from '@material-ui/icons'
import { I18n } from 'react-redux-i18n'

const anchor = { vertical: 'top', horizontal: 'right' }

class Errors extends React.PureComponent {
  constructor () {
    super()
    this.handleDismiss = this.handleDismiss.bind(this)
  }

  handleDismiss (id) {
    this.props.dismissError(id)
  }

  render () {
    const { errors } = this.props
    const components = []
    let icon
    errors.forEach((item, i) => {
      switch (item.get('severity')) {
        case 'info':
          icon = <ThumbUp />
          break
        case 'warn':
          icon = <Warning />
          break
        case 'error':
        default:
          icon = <Error />
      }
      const onClose = () => this.handleDismiss(i)
      const onClick = () => this.handleDismiss(i)
      components.push(
        <div key={i}>
          <Snackbar
            anchorOrigin={anchor}
            className={item.get('severity')}
            open
            autoHideDuration={item.get('severity') !== 'error' ? 3000 : null}
            onClose={onClose}
            message={<div className='wrapper-error-message'><div className='error-icon'>{icon}</div><span className='error-message'>{item.get('message')}</span></div>}
            action={
              <Button className='error-button' color='secondary' variant='flat' onClick={onClick}>
                {I18n.t('ui.buttons.ok')}
              </Button>
            }
          />
          {item.get('severity') === 'error' &&
            <div className='blur' />
          }
        </div>)
    })
    return (
      <div className='error-message'>
        {components}
      </div>
    )
  }
}

/**
 * Define the types of properties for the component
 * @type {Object}
 */
Errors.propTypes = {
  errors: PropTypes.oneOfType([PropTypes.instanceOf(Immutable.List), PropTypes.instanceOf(Array)]),
  dismissError: PropTypes.func
}
/**
 * Define default value for the component
 * @type {Object}
 */
Errors.defaultProps = {
  errors: [],
  dismissError: undefined
}

export default Errors
