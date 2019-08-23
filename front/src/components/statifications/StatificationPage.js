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
import { Button, Card } from '@material-ui/core'
import Immutable from 'immutable'

import Accordeon from '../elements/Accordeon'
import AccordeonWithCount
  from '../elements/AccordeonWithCount'
import StatificationFormContainer
  from '../../containers/statifications/StatificationFormContainer'
import StatificationListErrorsTypeMime
  from '../../components/statifications/StatificationListErrorsTypeMime'
import StatificationListErrorsHTML
  from '../../components/statifications/StatificationListErrorsHtml'
import StatificationListScannedFiles
  from '../../components/statifications/StatificationListScannedFiles'
import StatificationListExternalLinks
  from '../../components/statifications/StatificationListExternalLinks'
import StatificationListHistoric
  from '../../components/statifications/StatificationListHistoric'

class StatificationPage extends React.PureComponent {
  constructor (props) {
    super(props)

    this.publish = this.publish.bind(this)
    this.visualize = this.visualize.bind(this)
    this.handleAccordeon = this.handleAccordeon.bind(this)
  }

  componentDidMount () {
    if (this.props.id) {
      this.props.setCurrent(this.props.id)
      this.props.load(this.props.id)
    }
  }
  componentWillReceiveProps (props) {
    // if the statification id has changed
    if (this.props.id !== props.id) {
      // change current statification
      this.props.setCurrent(props.id)
      // reload the statification
      this.props.load(props.id)
    }

    return props
  }

  /**
   * dispatch the action pushToProd with the selected statification commit sha, only if the statification has not been already pushed to prod
   * this.props.id is the commit sha of the statification that is currently selected in the list
   */
  publish () {
    // if the selected statification is not already published, then dispatch the pushToProd action
    if (this.props.status !== 3) {
      this.props.pushToProd(this.props.id)
    }
  }

  /**
   * dispatch the action visualize with the selected statification commit sha, only if the statification has not been already visualized
   * this.props.id is the commit sha of the statification that is currently selected in the list
   */
  visualize () {
    // if the selected statification is not already visualized, then dispatch the visualize action
    if (this.props.status !== 4) {
      this.props.visualize(this.props.id)
    } else {
      window.open(I18n.t('url.site_visualize'), '_blank').focus()
    }
  }

  // set the active collapse to open and close the others
  handleAccordeon (accordeon) {
    if (this.props.activeAccordeon === accordeon) {
      this.props.setActiveAccordeon('')
    } else {
      this.props.setActiveAccordeon(accordeon)
    }
  }

  render () {
    return (
      <div>
        <div className='info_page'>
          <Accordeon
            title={I18n.t('statification.title')}
            accordeon='acc0'
            open={this.props.activeAccordeon === 'acc0'}
            onAccordeonChange={this.handleAccordeon}
          >
            <StatificationFormContainer form='statification_form_info' id={this.props.id} disabled />
          </Accordeon>
          <AccordeonWithCount
            title={I18n.t('statification.errors_html.title')}
            count={this.props.nb_errors_html}
            level='success-error'
            onAccordeonChange={this.handleAccordeon}
            accordeon='acc1'
            open={this.props.activeAccordeon === 'acc1'}
          >
            { this.props.nb_errors_html !== 0 &&
            <StatificationListErrorsHTML
              errors_html={this.props.errors_html}
              list_loading={this.props.list_loading}
            />
            }
            { this.props.nb_errors_html === 0 &&
            <div>
              {I18n.t('statification.errors_html.no_errors')}
            </div>
            }
          </AccordeonWithCount>
          <AccordeonWithCount
            title={I18n.t('statification.errors_type_mime.title')}
            count={this.props.nb_errors_type_mime}
            level='success-error'
            onAccordeonChange={this.handleAccordeon}
            accordeon='acc2'
            open={this.props.activeAccordeon === 'acc2'}
          >
            { this.props.nb_errors_type_mime !== 0 &&
            <StatificationListErrorsTypeMime
              errors_type_mime={this.props.errors_type_mime}
              list_loading={this.props.list_loading}
            />
            }
            { this.props.nb_errors_type_mime === 0 &&
              <div>
                {I18n.t('statification.errors_type_mime.no_errors')}
              </div>
            }
          </AccordeonWithCount>
          <AccordeonWithCount
            title={I18n.t('statification.scanned_files.title')}
            count={this.props.nb_scanned_files}
            level='info'
            onAccordeonChange={this.handleAccordeon}
            accordeon='acc3'
            open={this.props.activeAccordeon === 'acc3'}
          >
            <StatificationListScannedFiles
              scanned_files={this.props.scanned_files}
              list_loading={this.props.list_loading}
            />
          </AccordeonWithCount>
          <AccordeonWithCount
            title={I18n.t('statification.external_links.title')}
            count={this.props.nb_external_links}
            level='info'
            onAccordeonChange={this.handleAccordeon}
            accordeon='acc4'
            open={this.props.activeAccordeon === 'acc4'}
          >
            <StatificationListExternalLinks
              external_links={this.props.external_links}
              list_loading={this.props.list_loading}
            />
          </AccordeonWithCount>
          <Accordeon
            title={I18n.t('statification.historic.title')}
            onAccordeonChange={this.handleAccordeon}
            accordeon='acc5'
            open={this.props.activeAccordeon === 'acc5'}
          >
            <StatificationListHistoric
              historic={this.props.historic}
              list_loading={this.props.list_loading}
            />
          </Accordeon>
          <Card>
            {this.props.status !== 3 &&
              <div className='button-bar'>
                <Button variant='raised' onClick={this.publish} className='button-next' disabled={this.props.loading} >{I18n.t('ui.buttons.publish')}</Button>
                <Button variant='raised' onClick={this.visualize} className='button-next' disabled={this.props.loading} >{I18n.t('ui.buttons.visualize')}</Button>
              </div>
            }
          </Card>
        </div>
      </div>
    )
  }
}

/**
 * Define the types of properties for the component
 * @type {Object}
 */
StatificationPage.propTypes = {
  id: PropTypes.string,
  nb_errors_html: PropTypes.number,
  nb_errors_type_mime: PropTypes.number,
  nb_external_links: PropTypes.number,
  nb_scanned_files: PropTypes.number,
  // here for the array we get an Immutable.List  nb_errors_scrapy: 0, the first time the composent is loaded,
  // the solution is to set propTypes as one of array or object
  errors_html: PropTypes.oneOfType([PropTypes.instanceOf(Immutable.List), PropTypes.instanceOf(Array)]),
  errors_type_mime: PropTypes.oneOfType([PropTypes.instanceOf(Immutable.List), PropTypes.instanceOf(Array)]),
  external_links: PropTypes.oneOfType([PropTypes.instanceOf(Immutable.List), PropTypes.instanceOf(Array)]),
  historic: PropTypes.oneOfType([PropTypes.instanceOf(Immutable.List), PropTypes.instanceOf(Array)]),
  scanned_files: PropTypes.oneOfType([PropTypes.instanceOf(Immutable.List), PropTypes.instanceOf(Array)]),
  list_loading: PropTypes.bool,
  loading: PropTypes.bool,
  status: PropTypes.number,
  pushToProd: PropTypes.func,
  visualize: PropTypes.func,
  setCurrent: PropTypes.func,
  load: PropTypes.func,
  setActiveAccordeon: PropTypes.func,
  activeAccordeon: PropTypes.string
}

/**
 * Define default value for the component
 * @type {Object}
 */
StatificationPage.defaultProps = {
  id: '',
  nb_errors_html: 0,
  nb_errors_type_mime: 0,
  nb_external_links: 0,
  nb_scanned_files: 0,
  errors_html: [],
  errors_type_mime: [],
  external_links: [],
  historic: [],
  scanned_files: [],
  list_loading: false,
  loading: false,
  status: 0,
  pushToProd: undefined,
  visualize: undefined,
  setCurrent: undefined,
  load: undefined,
  setActiveAccordeon: undefined,
  activeAccordeon: ''
}

export default StatificationPage
