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
import { TextField, FormControl, FormHelperText } from '@material-ui/core'

/**
 * This component is used to render a TextField with the text helper.
 * It shouldn't be used alone, but used with the FormTextInput
 * @type {String}
 */
export default class TextInput extends React.PureComponent {
  render () {
    const { error } = this.props.meta
    return (
      <FormControl className='full-width' error={error !== undefined} disabled={this.props.disabled}>
        <TextField
          {...this.props.input}
          fullWidth
          label={this.props.text}
          error={error !== undefined}
          disabled={this.props.disabled}
          multiline={this.props.multiline}
          rowsMax={this.props.rowsMax}
        />
        <FormHelperText>{error || this.props.help}</FormHelperText>
      </FormControl>
    )
  }
}

/**
 * Define default value for the component
 * @type {Object}
 */
TextInput.defaultProps = {
  disabled: false,
  help: '',
  multiline: false,
  rowsMax: 0
}

/**
 * Define the types of properties for the component
 * @type {Object}
 */
TextInput.propTypes = {
  input: PropTypes.instanceOf(Object).isRequired, // the input properties from redux-form
  meta: PropTypes.instanceOf(Object).isRequired, // the meta properties given by redux-form, it contains the error message, warning, ...
  text: PropTypes.string.isRequired, // the label of the text input
  help: PropTypes.string, // a help text
  disabled: PropTypes.bool, // if the input should be disabled
  multiline: PropTypes.bool, // if the input should be multiline
  rowsMax: PropTypes.number // the maximum number of row the input should have
}
