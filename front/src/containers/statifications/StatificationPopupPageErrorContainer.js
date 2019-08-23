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
import { setActiveStep, clearListErrorInfo, setActiveAccordeon } from '../../actions/statifications'
import { statificationsStopProcess } from '../../actions/sagas'
import StatificationPopupPageError
  from '../../components/statifications/StatificationPopupPageError'

const mapStateToProps = (state, props) => ({
  nb_errors_html: state.statifications.getIn(['list_info_error', 'nb_errors_html']),
  nb_errors_scrapy: state.statifications.getIn(['list_info_error', 'nb_errors_scrapy']),
  nb_errors_type_mime: state.statifications.getIn(['list_info_error', 'nb_errors_type_mime']),
  nb_external_links: state.statifications.getIn(['list_info_error', 'nb_external_links']),
  nb_scanned_files: state.statifications.getIn(['list_info_error', 'nb_scanned_files']),
  errors_html: state.statifications.getIn(['list_info_error', 'errors_html']),
  errors_scrapy: state.statifications.getIn(['list_info_error', 'errors_scrapy']),
  errors_type_mime: state.statifications.getIn(['list_info_error', 'errors_type_mime']),
  external_links: state.statifications.getIn(['list_info_error', 'external_links']),
  historic: state.statifications.getIn(['list_info_error', 'historic']),
  scanned_files: state.statifications.getIn(['list_info_error', 'scanned_files']),
  loading: state.statifications.getIn(['list_info_error', 'loading']),
  activeAccordeon: state.statifications.get('activeAccordeon')
})

const mapDispatchToProps = (dispatch, props) => ({
  setActiveStep: (step) => {
    dispatch(setActiveStep(step))
  },

  stopProcess: () => {
    dispatch(statificationsStopProcess())
  },

  clearListErrorInfo: () => {
    dispatch(clearListErrorInfo())
  },

  setActiveAccordeon (accordeon) {
    dispatch(setActiveAccordeon(accordeon))
  }
})

const StatificationPopupPageErrorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(StatificationPopupPageError)

export default StatificationPopupPageErrorContainer
