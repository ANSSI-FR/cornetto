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
import { Route, Switch } from 'react-router'
import { Grid, Paper } from '@material-ui/core'
import StatificationListContainer from '../../containers/statifications/StatificationListContainer'
import StatificationPageContainer from '../../containers/statifications/StatificationPageContainer'

function StatificationHome () {
  return (
    <Grid container spacing={0}>
      <Grid item xs={4} className='statificationhome_leftpane'>
        <Paper elevation={4} className='inherit'>
          <StatificationListContainer />
        </Paper>
      </Grid>
      <Grid item xs={8} className='statificationhome_rightpane'>
        <Switch>
          <Route path='/list/' exact >
            {() => (
              <div className='placeholder_div' />
            )}
          </Route>
          <Route path='/list/statification/:id' exact >
            {({ match }) => (
              <StatificationPageContainer id={match ? match.params.id : -1} />
            )}
          </Route>
        </Switch>
      </Grid>
    </Grid>
  )
}

export default StatificationHome
