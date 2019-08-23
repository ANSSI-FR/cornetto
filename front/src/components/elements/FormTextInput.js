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
import { Field } from 'redux-form/immutable'
import TextInput from './TextInput'

/**
 * This component is used as a wrapper for redux-form Field
 * It is used to create a TextField for a form
 * @type {Object}
 */
export default class FormTextInput extends React.PureComponent {
  render () {
    return (
      <Field
        component={TextInput}
        name={this.props.field}
        text={I18n.t(`${this.props.form}.${this.props.field}.label`)}
        disabled={this.props.disabled}
        help={this.props.help ? I18n.t(`${this.props.form}.${this.props.field}.help`) : null}
        normalize={this.props.normalize}
        multiline={this.props.multiline}
        rowsMax={this.props.rowsMax}
      />
    )
  }
}

/**
 * Define default value for the component
 * @type {Object}
 */
FormTextInput.defaultProps = {
  disabled: false,
  help: undefined,
  normalize: undefined,
  multiline: false,
  rowsMax: 0
}

/**
 * Define the types of properties for the component
 * @type {Object}
 */
FormTextInput.propTypes = {
  field: PropTypes.string.isRequired, // the name of the field
  form: PropTypes.string.isRequired, // the name of the form
  disabled: PropTypes.bool, // if the field should be disabled
  help: PropTypes.string, // a help text
  multiline: PropTypes.bool, // is the field multiline
  rowsMax: PropTypes.number, // the maximum number of rows the field should have
  normalize: PropTypes.func // the method used to normalize the data typed by the user
}
