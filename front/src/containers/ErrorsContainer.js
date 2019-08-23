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
import Errors from '../components/Errors'
import { clearErrors, dismissError } from '../actions/errors'

const mapStateToProps = (state, props) => ({
  errors: state.errors.get('errors')
})

const mapDispatchToProps = (dispatch, props) => ({
  clearErrors: () => {
    dispatch(clearErrors())
  },

  dismissError: (position) => {
    dispatch(dismissError(position))
  }
})

const ErrorsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Errors)

export default ErrorsContainer
