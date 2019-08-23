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
import { Button } from '@material-ui/core'
import Immutable from 'immutable'

import AccordeonCardWithCount from '../elements/AccordeonWithCount'
import StatificationListErrorsTypeMime
  from '../../components/statifications/StatificationListErrorsTypeMime'
import StatificationListErrorsScrapy
  from '../../components/statifications/StatificationListErrorsScrapy'
import StatificationListErrorsHTML
  from '../../components/statifications/StatificationListErrorsHtml'
import StatificationListScannedFiles
  from '../../components/statifications/StatificationListScannedFiles'
import StatificationListExternalLinks
  from '../../components/statifications/StatificationListExternalLinks'
import StatificationListHistoric
  from '../../components/statifications/StatificationListHistoric'

const Json2csvParser = require('json2csv').Parser

class StatificationPopupPageError extends React.PureComponent {
  constructor (props) {
    super(props)
    this.onCancelClick = this.onCancelClick.bind(this)
    this.handleAccordeon = this.handleAccordeon.bind(this)
    this.exportCSV = this.exportCSV.bind(this)
  }

  onCancelClick (e) {
    // prevent default behaviour on event
    e.preventDefault()
    // stop the process and delete the unsaved statification
    this.props.stopProcess()
    // send user to step 0
    this.props.setActiveStep(0)
    // clear list error
    this.props.clearListErrorInfo()
  }
  /* set the active collapse to open and close the others */
  handleAccordeon (accordeon) {
    this.props.setActiveAccordeon(accordeon)
  }

  /**
   * This method get the list of abonnes and export it to the user as csv file
   */
  exportCSV () {
    // create a csv file from type mime errors
    const fieldsErrorsTypeMime = ['type_mime', 'url']
    let csvTypeMime = I18n.t('export_csv.empty_csv')
    try {
      const json2csvParserTypeMime = new Json2csvParser({ fieldsErrorsTypeMime })
      csvTypeMime = json2csvParserTypeMime.parse(this.props.errors_type_mime.toJS())
    } catch (error) {
      console.log('Empty csv csvTypeMime')
    }

    // create a csv file from external links errors
    const fieldsExternalLinks = ['source', 'url']
    let csvExternalLinks = I18n.t('export_csv.empty_csv')
    try {
      const json2csvParserExternalLinks = new Json2csvParser({ fieldsExternalLinks })
      csvExternalLinks = json2csvParserExternalLinks.parse(this.props.external_links.toJS())
    } catch (error) {
      console.log('Empty csv csvExternalLinks')
    }

    // create a csv file from html errors
    const fieldsHTMLErrors = ['source', 'url']
    let csvHTMLErrors = I18n.t('export_csv.empty_csv')
    try {
      const json2csvParserHTMLErrors = new Json2csvParser({ fieldsHTMLErrors })
      csvHTMLErrors = json2csvParserHTMLErrors.parse(this.props.errors_html.toJS())
    } catch (error) {
      console.log('Empty csv csvHTMLErrors')
    }

    // create a csv file from list of scanned files
    const fieldsScannedFiles = ['nb', 'type_file']
    let csvScannedFiles = I18n.t('export_csv.empty_csv')
    try {
      const json2csvParserScannedFiles = new Json2csvParser({ fieldsScannedFiles })
      csvScannedFiles = json2csvParserScannedFiles.parse(this.props.scanned_files.toJS())
    } catch (error) {
      console.log('Empty csv csvScannedFiles')
    }

    // create a csv file from list of scrapy errors
    const fieldsScrapyErrors = ['error_code']
    let csvScrapyErrors = I18n.t('export_csv.empty_csv')
    try {
      const json2csvParserScrapyErrors = new Json2csvParser({ fieldsScrapyErrors })
      csvScrapyErrors = json2csvParserScrapyErrors.parse(this.props.errors_scrapy.toJS())
    } catch (error) {
      console.log('Empty csv csvScrapyErrors')
    }

    // create a csv file from historique of the statification
    const fieldsStatificationHistorics = ['action', 'date', 'user']
    let csvStatificationHistorics = I18n.t('export_csv.empty_csv')
    try {
      const json2csvParserStatificationHistorics = new Json2csvParser({ fieldsStatificationHistorics })
      csvStatificationHistorics = json2csvParserStatificationHistorics.parse(this.props.historic.toJS())
    } catch (error) {
      console.log('Empty csv csvStatificationHistorics')
    }

    // create a csv file that contain all the previously created csv files
    const csvContainingErrors = I18n.t('export_csv.errors_scrapy') + '\n' + csvScrapyErrors + '\n\n' +
      I18n.t('export_csv.errors_html') + '\n' + csvHTMLErrors + '\n\n' +
      I18n.t('export_csv.errors_type_mime') + '\n' + csvTypeMime + '\n\n' +
      I18n.t('export_csv.scanned_files') + '\n' + csvScannedFiles + '\n\n' +
      I18n.t('export_csv.external_links') + '\n' + csvExternalLinks + '\n\n' +
      I18n.t('export_csv.historic') + '\n' + csvStatificationHistorics

    // export as downlodable content
    var pp = document.createElement('a')
    pp.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(csvContainingErrors)}`)
    pp.setAttribute('download', 'export.csv')
    document.body.appendChild(pp)
    pp.click()
  }

  render () {
    return (
      <div className='log-wrapper'>
        <div className='log-content'>
          <Button onClick={this.onCancelClick} className='close-page'>{I18n.t('ui.steps.cancel')}</Button>
          <Button onClick={this.exportCSV} className='close-page'>{I18n.t('ui.buttons.export')}</Button>
          <h2>Affichage des erreurs</h2>
          <AccordeonCardWithCount
            title={I18n.t('statification.errors_scrapy.title')}
            count={this.props.nb_errors_scrapy}
            level='success-error'
            onAccordeonChange={this.handleAccordeon}
            accordeon='acc0'
            open={this.props.activeAccordeon === 'acc0'}
          >
            <StatificationListErrorsScrapy
              errors_scrapy={this.props.errors_scrapy}
              loading={this.props.loading}
            />
          </AccordeonCardWithCount>
          <AccordeonCardWithCount
            title={I18n.t('statification.errors_html.title')}
            count={this.props.nb_errors_html}
            level='success-error'
            onAccordeonChange={this.handleAccordeon}
            accordeon='acc1'
            open={this.props.activeAccordeon === 'acc1'}
          >
            <StatificationListErrorsHTML
              errors_html={this.props.errors_html}
              loading={this.props.loading}
            />
          </AccordeonCardWithCount>
          <AccordeonCardWithCount
            title={I18n.t('statification.errors_type_mime.title')}
            count={this.props.nb_errors_type_mime}
            level='success-error'
            onAccordeonChange={this.handleAccordeon}
            accordeon='acc2'
            open={this.props.activeAccordeon === 'acc2'}
          >
            <StatificationListErrorsTypeMime
              errors_type_mime={this.props.errors_type_mime}
              loading={this.props.loading}
            />
          </AccordeonCardWithCount>
          <AccordeonCardWithCount
            title={I18n.t('statification.scanned_files.title')}
            count={this.props.nb_scanned_files}
            level='info'
            onAccordeonChange={this.handleAccordeon}
            accordeon='acc3'
            open={this.props.activeAccordeon === 'acc3'}
          >
            <StatificationListScannedFiles
              scanned_files={this.props.scanned_files}
              loading={this.props.loading}
            />
          </AccordeonCardWithCount>
          <AccordeonCardWithCount
            title={I18n.t('statification.external_links.title')}
            count={this.props.nb_external_links}
            level='info'
            onAccordeonChange={this.handleAccordeon}
            accordeon='acc4'
            open={this.props.activeAccordeon === 'acc4'}
          >
            <StatificationListExternalLinks
              external_links={this.props.external_links}
              loading={this.props.loading}
            />
          </AccordeonCardWithCount>
          <AccordeonCardWithCount
            title={I18n.t('statification.historic.title')}
            onAccordeonChange={this.handleAccordeon}
            accordeon='acc5'
            open={this.props.activeAccordeon === 'acc5'}
          >
            <StatificationListHistoric
              historic={this.props.historic}
              loading={this.props.loading}
            />
          </AccordeonCardWithCount>
        </div>
      </div>
    )
  }
}

/**
 * Define the types of properties for the component
 * @type {Object}
 */
StatificationPopupPageError.propTypes = {
  nb_errors_html: PropTypes.number,
  nb_errors_scrapy: PropTypes.number,
  nb_errors_type_mime: PropTypes.number,
  nb_external_links: PropTypes.number,
  nb_scanned_files: PropTypes.number,
  // here for the array we get an Immutable.List the first time the composent is loaded,
  // the solution is to set propTypes as one of array or object
  errors_scrapy: PropTypes.oneOfType([PropTypes.instanceOf(Immutable.List), PropTypes.instanceOf(Array)]),
  errors_html: PropTypes.oneOfType([PropTypes.instanceOf(Immutable.List), PropTypes.instanceOf(Array)]),
  errors_type_mime: PropTypes.oneOfType([PropTypes.instanceOf(Immutable.List), PropTypes.instanceOf(Array)]),
  external_links: PropTypes.oneOfType([PropTypes.instanceOf(Immutable.List), PropTypes.instanceOf(Array)]),
  historic: PropTypes.oneOfType([PropTypes.instanceOf(Immutable.List), PropTypes.instanceOf(Array)]),
  scanned_files: PropTypes.oneOfType([PropTypes.instanceOf(Immutable.List), PropTypes.instanceOf(Array)]),
  loading: PropTypes.bool,
  stopProcess: PropTypes.func,
  setActiveStep: PropTypes.func,
  clearListErrorInfo: PropTypes.func,
  setActiveAccordeon: PropTypes.func,
  activeAccordeon: PropTypes.string
}

/**
 * Define default value for the component
 * @type {Object}
 */
StatificationPopupPageError.defaultProps = {
  nb_errors_html: 0,
  nb_errors_scrapy: 0,
  nb_errors_type_mime: 0,
  nb_external_links: 0,
  nb_scanned_files: 0,
  errors_scrapy: [],
  errors_html: [],
  errors_type_mime: [],
  external_links: [],
  historic: [],
  scanned_files: [],
  loading: false,
  stopProcess: undefined,
  setActiveStep: undefined,
  clearListErrorInfo: undefined,
  setActiveAccordeon: undefined,
  activeAccordeon: ''
}

export default StatificationPopupPageError
