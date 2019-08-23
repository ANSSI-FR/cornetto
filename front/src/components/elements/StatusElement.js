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
import { I18n } from 'react-redux-i18n'

export default class StatusElement extends React.PureComponent {
  /**
   * [getStatusText description]
   * @return {[type]} [description]
   */
  getStatusText () {
    switch (this.props.status) {
      case 2:
        return ''
      case 3:
        return I18n.t('statification.statut.prod')
      case 4:
        return I18n.t('statification.statut.visualize')
      default:
        return ''
    }
  }
  /**
   * getBgColor get the color for the background corresponding to the level set in the propos
   * @return {[type]} the correspondingbackground-color value for css
   */
  getBgColor () {
    switch (this.props.status) {
      case 2:
        return 'transparent'
      case 3:
        return '#1fe977'
      case 4:
        return '#f78a46'
      default:
        return 'transparent'
    }
  }
  /**
   * [render description]
   * @return {[type]} [description]
   */
  render () {
    const style = {
      backgroundColor: this.getBgColor()
    }
    return (
      <span className='statusElement' style={style} >
        {this.getStatusText()}
      </span>
    )
  }
}

/**
 * Define default value for the component
 * @type {Object}
 */
StatusElement.defaultProps = {
  status: 2
}

/**
 * Define the types of properties for the component
 * @type {Object}
 */
StatusElement.propTypes = {
  status: PropTypes.number
}
