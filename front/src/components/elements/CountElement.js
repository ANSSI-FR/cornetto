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

export default class CountElement extends React.PureComponent {
  /**
   * getBgColor get the color for the background corresponding to the level set in the propos
   * @return {[type]} the correspondingbackground-color value for css
   */
  getBgColor () {
    switch (this.props.level) {
      case 'info':
        return '#5293d8'
      case 'success':
        return '#1fe977'
      case 'warning':
        return '#f78a46'
      case 'error':
        return '#c00'
      case 'success-error':
        if (this.props.count > 0) {
          return '#c00'
        }

        return '#1fe977'
      default:
        return '#5293d8'
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
      <span className='pop' style={style} >
        {this.props.count}
      </span>
    )
  }
}

/**
 * Define default value for the component
 * @type {Object}
 */
CountElement.defaultProps = {
  count: 0,
  level: ''
}

/**
 * Define the types of properties for the component
 * @type {Object}
 */
CountElement.propTypes = {
  count: PropTypes.number,
  level: PropTypes.string
}
