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
import Immutable from 'immutable'
import PropTypes from 'prop-types'
import { TableCell } from '@material-ui/core'
import { Grid, VirtualTable, TableHeaderRow } from '@devexpress/dx-react-grid-material-ui'
import { SortingState, IntegratedSorting } from '@devexpress/dx-react-grid'
import { I18n } from 'react-redux-i18n'

const moment = require('moment')

const getRowId = row => row.id

const cellTemplate = (props) => {
  if (props.column.name === 'creation' || props.column.name === 'modification') {
    return <TableCell>{moment(props.row[props.column]).format('DD/MM/YYYY')}</TableCell>
  } else if (props.column.name === 'url') {
    if (props.row[props.column.name].length > 71) {
      const truncSize = props.row[props.column.name].length - 71
      return (
        <TableCell>
          <a
            href={props.row[props.column.name]}
            title={props.row[props.column.name]}
          >
            {`...${props.row[props.column.name].substr(truncSize)}`}
          </a>
        </TableCell>
      )
    } else if (props.row[props.column.name] !== 'source inconnue' && props.row[props.column.name] !== 'None') {
      return (
        <TableCell>
          <a
            href={props.row[props.column.name]}
            title={props.row[props.column.name]}
          >
            {props.row[props.column.name]}
          </a>
        </TableCell>
      )
    }
  }
  return <VirtualTable.Cell {...props} />
}

const noDataCellTemplate = ({ colSpan }) => <TableCell colSpan={colSpan}><big>{I18n.t('search.no_result')}</big></TableCell>

class StatificationListErrorsTypeMime extends React.PureComponent {
  constructor (props) {
    super(props)

    // define header of the table and the way
    // cells will be retreive from the json
    this.columns = [
      {
        name: 'type_mime',
        title: I18n.t('statification.errors_type_mime.type_mime')
      },
      {
        name: 'url',
        title: I18n.t('statification.errors_type_mime.url')
      }
    ]

    this.sorting = [{ columnName: 'type_mime', direction: 'asc' }]

    this.setSort = this.setSort.bind(this)
    this.getHeight = this.getHeight.bind(this)
  }

  setSort (value) {
    this.sorting = value
  }

  getHeight () {
    const size = (48 * (this.props.errors_type_mime.toJS().length + 1)) + 50
    return (size < 500) ? size : 500
  }

  render () {
    return (
      <div className='statificationlist_short'>
        <Grid rows={this.props.errors_type_mime.toJS()} columns={this.columns} getRowId={getRowId}>
          <SortingState
            defaultSorting={[{ columnName: 'type_mime', direction: 'asc' }]}
            onSortingChange={this.setSort}
          />
          <IntegratedSorting />
          <VirtualTable
            height={this.getHeight()}
            estimatedRowHeight={48}
            cellComponent={cellTemplate}
            noDataCellComponent={noDataCellTemplate}
          />
          <TableHeaderRow showSortingControls />
        </Grid>
      </div>
    )
  }
}

/**
 * Define the types of properties for the component
 * @type {Object}
 */
StatificationListErrorsTypeMime.propTypes = {
  // here for the array we get an Immutable.List  nb_errors_scrapy: 0, the first time the composent is loaded,
  // the solution is to set propTypes as one of array or object
  errors_type_mime: PropTypes.oneOfType([PropTypes.instanceOf(Immutable.List), PropTypes.instanceOf(Array)])
}

/**
 * Define default value for the component
 * @type {Object}
 */
StatificationListErrorsTypeMime.defaultProps = {
  errors_type_mime: []
}

/**
 * Define the types of properties for the component
 * @type {Object}
 */
cellTemplate.propTypes = {
  column: PropTypes.instanceOf(Object),
  row: PropTypes.instanceOf(Object)
}

/**
 * Define default value for the component
 * @type {Object}
 */
cellTemplate.defaultProps = {
  column: {},
  row: {}
}

/**
 * Define the types of properties for the component
 * @type {Object}
 */
noDataCellTemplate.propTypes = {
  colSpan: PropTypes.number
}

/**
 * Define default value for the component
 * @type {Object}
 */
noDataCellTemplate.defaultProps = {
  colSpan: 0
}

export default StatificationListErrorsTypeMime
