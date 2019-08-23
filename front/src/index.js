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
/**
 *  following are import from node modules
 */
import '@babel/polyfill'
import 'whatwg-fetch'
import React from 'react'
import ReactDOM from 'react-dom'
import { Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { connectRouter, ConnectedRouter, routerMiddleware } from 'connected-react-router'

import createBrowserHistory from 'history/createBrowserHistory'

import { compose, createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import createSagaMiddleware from 'redux-saga'
import { loadTranslations, setLocale, i18nReducer, I18n } from 'react-redux-i18n'
import { reducer as formReducer } from 'redux-form/immutable'
import { persistStore, persistCombineReducers, createTransform } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import Serialize from 'remotedev-serialize'
import Immutable from 'immutable'

/**
 *  Following are import from custom files
 */

// Import of the reducers
import statifications from './reducers/statifications'
import errors from './reducers/errors'
import dialog from './reducers/dialog'
import options from './reducers/options'

// import sagas
import sagas from './sagas/sagas'

// import class css
import './css/custom.css'
import './css/icon.css'

// import the file containing all strings for translation
import strings from './strings'

// import the App
import AppContainer from './containers/AppContainer'

const immutableReconciler = (inbound, original, reduced) => {
  const state = Object.assign({}, reduced)
  if (!inbound) inbound = {}
  Object.keys(reduced).forEach((key) => {
    if (key === '_persist' || original[key] !== reduced[key]) return
    state[key] = Immutable.Map.isMap(state[key]) ? state[key].merge(inbound[key]) : Object.assign(Object.assign({}, state[key]), inbound[key])
  })
  return state
}

const serializer = Serialize.immutable(Immutable)
const immutableTransform = createTransform(serializer.stringify, serializer.parse, {})

const config = {
  key: 'root',
  storage,
  transforms: [
    immutableTransform
  ],
  stateReconciler: immutableReconciler,
  blacklist: ['i18n', 'form', 'errors']
}

const initialState = {}
const history = createBrowserHistory()
const routingMiddleware = routerMiddleware(history)
const sagaMiddleware = createSagaMiddleware()

/**
 * Combine all reducers
 */
const reducers = persistCombineReducers(config, {
  statifications,
  errors,
  options,
  dialog,
  i18n: i18nReducer,
  form: formReducer
})

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(
  connectRouter(history)(reducers),
  initialState,
  composeEnhancers(applyMiddleware(sagaMiddleware, routingMiddleware, thunk))
)

const persistor = persistStore(store, {}, () => {
  sagaMiddleware.run(sagas)

  I18n.setTranslationsGetter(() => store.getState().i18n.translations)
  I18n.setLocaleGetter(() => store.getState().i18n.locale)
  store.dispatch(loadTranslations(strings))
  store.dispatch(setLocale('fr'))

  ReactDOM.render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Route path='/' component={AppContainer} />
      </ConnectedRouter>
    </Provider>,
    document.getElementById('root')
  )
})
