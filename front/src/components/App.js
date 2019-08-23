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
import { Route } from 'react-router'
import { Toolbar, Tabs, Tab } from '@material-ui/core'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles'
import { blue, blueGrey } from '@material-ui/core/colors'

import ErrorsContainer from '../containers/ErrorsContainer'
import StatificationHome from '../components/statifications/StatificationHome'
import StatificationCreateContainer from '../containers/statifications/StatificationCreateContainer'
import StatificationPopupPageErrorContainer from '../containers/statifications/StatificationPopupPageErrorContainer'
import StatificationDialogContainer from '../containers/statifications/StatificationDialogContainer'
import { clearAllSetInterval } from '../utils'

// import Image from '../imgs/logo-web-rond.png'
import Image from '../imgs/logo_anssi.png'

const theme = createMuiTheme({
  palette: {
    primary: blue,
    secondary: blueGrey
  },
  typography: {
    htmlFontSize: 16
  }
})

class App extends React.PureComponent {
  constructor (props) {
    super(props)
    this.onTabChange = this.onTabChange.bind(this)
  }

  componentDidMount () {
    // check status on mount
    this.props.checkStatus(this.props.activeStep, this.props.waitForServer)
    // we set a first interval that will check the status of api every 3 sec
    setInterval(this.props.checkStatus, 6000, this.props.activeState, this.props.waitForServer)
  }

  componentWillReceiveProps (props) {
    if (props.statificationRunning === false) {
      this.props.setIsBeingStopped(false)
    }

    // clear all the interval that have been set
    clearAllSetInterval()

    if (!props.clearInterval) {
      // start a new interval to check for the status of api
      setInterval(this.props.checkStatus, 6000, props.activeStep, props.waitForServer)
    }

    // if something is loading change the cursor to wait
    if (props.loading) {
      document.getElementById('root').classList.add('wait')
    } else {
      // if nothing is loading remove the class
      document.getElementById('root').classList.remove('wait')
    }

    return props
  }

  onTabChange (e, value) {
    // if a process is running, or if the user is in step 2 or 3 then prompt a confirm popup if the user is on tab /create (value = 0)
    if (!this.props.isBeingStopped && value === 1 &&
      (this.props.statificationRunning || this.props.activeStep === 1 || this.props.activeStep === 2)) {
      // trigger the dialog popup that will ask the user to confirm change tab action
      // if the user confirm, then the statification will be stopped and deleted
      this.props.setDialogTitle(I18n.t('statification.dialog.change_tab.title'))
      this.props.setDialogText(I18n.t('statification.dialog.change_tab.text'))
      this.props.setDialogTypeAction('change_tab')
      this.props.showDialog(true)
    } else if (!this.props.isBeingStopped) {
      // if the nothing is being stopped then change tab
      this.props.tabChange(value)
    }
    // if something is being stopped then do nothing
  }

  render () {
    return (
      <MuiThemeProvider theme={theme}>
        <header>
          <Toolbar className='toolbar'>
            <img src={Image} className='logo' />
            <a href={I18n.t('url.site_prod')} target='blank' className='websiteLink'>{I18n.t('url.name')}</a>
            <Tabs value={this.props.tab} onChange={this.onTabChange} className='tabs'>
              <Tab label={I18n.t('ui.tabs.create')} className='tab' />
              <Tab label={I18n.t('ui.tabs.list')} className='tab' />
            </Tabs>
          </Toolbar>
        </header>
        { (this.props.islistErrorSet === 0) &&
        <main className='wrapper'>
          <Route path='/' component={StatificationCreateContainer} exact />
          <Route path='/create' component={StatificationCreateContainer} />
          <Route path='/list' component={StatificationHome} />
        </main>
        }
        {(this.props.islistErrorSet !== 0 && this.props.activeStep === 1) &&
        <main className='showlog'>
          <StatificationPopupPageErrorContainer />
        </main>
        }
        <footer className='footer'>
          <nav>
            <center>Contactez le <span className='bold'>CDA</span> au <span className='bold'>8900</span> en cas d'erreur bloquante.</center>
          </nav>
        </footer>
        <ErrorsContainer />
        <StatificationDialogContainer fullScreen={false} dialog_text={this.props.title} dialog_title={this.props.text} />
      </MuiThemeProvider>
    )
  }
}

/**
 * Define the types of properties for the component
 * @type {Object}
 */
App.propTypes = {
  islistErrorSet: PropTypes.number,
  tab: PropTypes.number,
  activeStep: PropTypes.number,
  statificationRunning: PropTypes.bool,
  isBeingStopped: PropTypes.bool,
  tabChange: PropTypes.func,
  checkStatus: PropTypes.func,
  showDialog: PropTypes.func,
  setDialogTitle: PropTypes.func,
  setDialogText: PropTypes.func,
  setDialogTypeAction: PropTypes.func,
  setIsBeingStopped: PropTypes.func,
  title: PropTypes.string,
  text: PropTypes.string
}
/**
 * Define default value for the component
 * @type {Object}
 */
App.defaultProps = {
  islistErrorSet: 0,
  tab: 0,
  activeStep: 0,
  statificationRunning: false,
  isBeingStopped: false,
  tabChange: undefined,
  checkStatus: undefined,
  showDialog: undefined,
  setDialogTitle: undefined,
  setDialogText: undefined,
  setDialogTypeAction: undefined,
  setIsBeingStopped: undefined,
  title: '',
  text: ''
}
export default App
