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
import * as React from 'react'
import Immutable from 'immutable'
import PropTypes from 'prop-types'
import { I18n } from 'react-redux-i18n'
import { LinearProgress, Button } from '@material-ui/core'
import { Template, TemplateConnector } from '@devexpress/dx-react-core'
import {
  Grid,
  TableHeaderRow,
  TableColumnResizing,
  TableSelection,
  VirtualTable
} from '@devexpress/dx-react-grid-material-ui'
import {
  PagingState, SortingState,
  SelectionState, IntegratedSorting
} from '@devexpress/dx-react-grid'

import StatusElement from '../../components/elements/StatusElement'

const moment = require('moment')

/**
 * Define how the row id should be got
 * @param  {Object} row the object row
 * @return {string}     the commit sha of the row
 */
const getRowId = row => row.commit

/**
 * Define how is created a row in the list
 * @param {Object} props    the properties passed to the component
 * @return {VirtualTable.Row}         return the row component
 */
const Row = props => (
  <VirtualTable.Row
    {...props}
    onClick={props.onToggle}

    // if the row is selected then add the correct css class
    className={props.selected ? 'selectedRow' : 'unselectedRow'}
  />
)

/**
 * Define how is created and formatted a Cell in the list
 * @param {Object} props the properties passed to the component
 * @return {VirtualTable.Cell}      return the Cell component
 */
const Cell = (props) => {
  // if the cell is for the column creation or modification then it's a date
  if (props.column.name === 'creation' ||
   props.column.name === 'modification') {
    return (
      <VirtualTable.Cell>
        {moment(props.row[props.column.name]).format('DD/MM/YYYY')}
      </VirtualTable.Cell>
    )

    // if the cell is for the column status then show a StatusElement component
  } else if (props.column.name === 'status') {
    return (
      <VirtualTable.Cell>
        <StatusElement status={(props.row[props.column.name])} />
      </VirtualTable.Cell>
    )
  }

  // in other case just show the text value of the cell
  return <VirtualTable.Cell {...props} />
}

/**
 * Cell that will be showed only if there is no data
 * @param  {[type]} colSpan the number of column to consider for colSpan
 * @return {VirtualTable.Cell}         return the cell component
 */
const noDataCell = ({ colSpan }) => (
  <VirtualTable.Cell colSpan={colSpan}>
    <big>{I18n.t('search.no_result')}</big>
  </VirtualTable.Cell>
)

class StatificationList extends React.PureComponent {
  constructor (props) {
    super(props)

    /**
     * Local state of the component
     * Here we store the selected row in the array selection
     * and we store the height of the list
     * @type {Object}
     */
    this.state = {
      selection: [],
      height: 540
    }

    // define header of the table and the way
    // cells will be retreive from the json
    this.columns = [
      {
        name: 'cre_date',
        title: I18n.t('statification.cre_date.label')
      },
      {
        name: 'upd_date',
        title: I18n.t('statification.upd_date.label')
      },
      {
        name: 'designation',
        title: I18n.t('statification.designation.label')
      },
      {
        name: 'status',
        title: I18n.t('statification.statut.label')
      }
    ]

    this.defaultColumnWidths = [
      { columnName: 'cre_date', width: 140 },
      { columnName: 'upd_date', width: 137 },
      { columnName: 'designation', width: 195 },
      { columnName: 'status', width: 67 }
    ]

    this.sorting = [{ columnName: 'upd_date', direction: 'desc' }]

    this.setSort = this.setSort.bind(this)
    this.onSelectionChange = this.onSelectionChange.bind(this)
    this.changeLimit = this.changeLimit.bind(this)
    this.changeSelection = selection => this.setState({ selection })
    this.changeHeight = height => this.setState({ height })
  }

  // when the composent is mounted for the first time
  componentDidMount () {
    // fix the limit to 10 when the component mount
    this.props.setLimit(10)

    // clear the selection when the component is mounted
    this.changeSelection([])

    // clear the id in the url so no statification content will be printed in the StatificationPage
    this.props.open([])

    // load the number of statifications from API
    this.props.countStatifications()

    // load the list of statifications from API
    this.props.listStatifications(10, this.props.skip)
  }

  // when the component receive new props
  componentWillReceiveProps (props) {
    // change selection only if the new current and the old one are different
    if (this.props.list !== props.list) {
      this.changeSelection([props.list.toJS()[0].commit])
      this.props.open([props.list.toJS()[0].commit])
    } else if (this.props.current !== props.current) {
      this.changeSelection([props.current])
    }

    // get the number of statification
    this.props.countStatifications()

    // if the limit or skip properties have changed
    if (props.limit !== this.props.limit || props.skip !== this.props.skip) {
      // request the new list of statification
      this.props.listStatifications(props.limit, props.skip)
    }

    return props
  }

  /**
   * This method is called when a statification is selected
   * It will change the url with the commit sha corresponding of the selected statification
   * @param  {[type]} selection The array of selected statification (it contain the list of the commit sha of selected statifications)
   */
  onSelectionChange (selection) {
    // copy the var
    let selectionArray = selection

    // if selection is an array
    if (Array.isArray(selectionArray)) {
      // remove one row of the selection (the first element)
      selectionArray = selectionArray.pop()
    }

    // if one element is selected
    if (selectionArray) {
      // open the selected element
      this.props.open(selectionArray)
    }
  }

  // change the sorting
  setSort (value) {
    this.sorting = value
  }

  // change the number of statifications in the list
  changeLimit () {
    // if the limit was 10 then change to show all statification in the list
    if (this.props.limit === 10) {
      this.props.setLimit(this.props.count)
      this.changeHeight(776)
    } else {
      // if the number wasn't 10 then show the first 10 statifications
      this.props.setLimit(10)
      this.changeHeight(540)
    }
  }

  render () {
    const { selection, height } = this.state
    return (
      <div className='statificationlist_short'>
        <Grid rows={this.props.list.toJS()} columns={this.columns} getRowId={getRowId}>
          <SortingState
            defaultSorting={[{ columnName: 'upd_date', direction: 'desc' }]}
            onSortingChange={this.setSort}
          />
          <IntegratedSorting />
          <PagingState
            pageSize={this.props.limit}
          />
          <SelectionState
            selection={selection}
            onSelectionChange={this.onSelectionChange}
          />
          <VirtualTable
            height={height}
            cellComponent={Cell}
            rowComponent={Row}
            noDataCellComponent={noDataCell}
          />
          <TableColumnResizing defaultColumnWidths={this.defaultColumnWidths} />
          <TableHeaderRow showSortingControls />
          <TableSelection showSelectionColumn={false} />
          {/* Override the tableRow Template to make rowComponent behave has we want */}
          <Template
            name='tableRow'
            predicate={({ tableRow }) => tableRow.type === 'data'}
          >
            {params => (
              <TemplateConnector>
                {({ selection }, { toggleSelection }) => (
                  <Row
                    {...params}
                    selected={selection.indexOf(params.tableRow.rowId) > -1}
                    onToggle={() => {
                      toggleSelection({ rowIds: [params.tableRow.rowId] })
                      this.changeSelection([params.tableRow.rowId])
                    }}

                  />
                )}
              </TemplateConnector>
            )}
          </Template>
        </Grid>
        {this.props.loading &&
          <div className='statificationlist-loading-parent'>
            <LinearProgress className='statificationlist-loading-child_short' />
          </div>
        }
        <Button
          variant='raised'
          className='listDrowpdownButton'
          onClick={this.changeLimit}
        >
          { (this.props.limit === 10) && <span>{I18n.t('ui.buttons.show_all')}</span>}
          { (this.props.limit !== 10) && <span>{I18n.t('ui.buttons.show_ten_last')}</span>}
        </Button>
      </div>
    )
  }
}

/**
 * Define the types of properties for the component
 * @type {Object}
 */
StatificationList.propTypes = {
  count: PropTypes.number,
  skip: PropTypes.number,
  limit: PropTypes.number,
  current: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  // here for the array we get an Immutable.List  nb_errors_scrapy: 0,
  // the first time the composent is loaded,
  // the solution is to set propTypes as one of array or object
  list: PropTypes.oneOfType([PropTypes.instanceOf(Immutable.List), PropTypes.instanceOf(Array)]),
  loading: PropTypes.bool,
  countStatifications: PropTypes.func,
  setLimit: PropTypes.func,
  open: PropTypes.func,
  listStatifications: PropTypes.func,
  classes: PropTypes.instanceOf(Object)
}

/**
 * Define default value for the component
 * @type {Object}
 */
StatificationList.defaultProps = {
  count: 0,
  skip: 0,
  limit: 0,
  current: '',
  list: [],
  loading: false,
  countStatifications: undefined,
  setLimit: undefined,
  open: undefined,
  listStatifications: undefined,
  classes: {}
}

/**
 * Define the type of properties for the component
 * @type {Object}
 */
Row.propTypes = {
  selected: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired
}

/**
 * Define the types of properties for the component
 * @type {Object}
 */
Cell.propTypes = {
  column: PropTypes.instanceOf(Object),
  row: PropTypes.instanceOf(Object)
}

/**
 * Define default value for the component
 * @type {Object}
 */
Cell.defaultProps = {
  column: {},
  row: {}
}

/**
 * Define the types of properties for the component
 * @type {Object}
 */
noDataCell.propTypes = {
  colSpan: PropTypes.number
}

/**
 * Define default value for the component
 * @type {Object}
 */
noDataCell.defaultProps = {
  colSpan: 0
}

export default StatificationList
