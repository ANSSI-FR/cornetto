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
import { push } from 'react-router-redux'

import StatificationList from '../../components/statifications/StatificationList'
import { setLimit, setSkip } from '../../actions/statifications'
import { listStatifications, countStatifications } from '../../actions/sagas'

const mapStateToProps = (state, props) => ({
  limit: state.statifications.get('limit'),
  skip: state.statifications.get('skip'),
  list: state.statifications.get('list'),
  count: state.statifications.get('count'),
  loading: state.statifications.getIn('loading'),
  current: state.statifications.get('current')
})

const mapDispatchToProps = (dispatch, props) => ({
  open: (id) => {
    dispatch(push(`/list/statification/${id}`))
  },

  countStatifications: () => {
    dispatch(countStatifications())
  },

  setLimit: (limit) => {
    dispatch(setLimit(limit))
  },

  setSkip: (skip) => {
    dispatch(setSkip(skip))
  },

  listStatifications: (limit, skip) => {
    dispatch(listStatifications(limit, skip))
  }
})

const StatificationListContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(StatificationList)

export default StatificationListContainer
