import React from 'react'
import {Route, Switch} from 'react-router-dom'
import {Scraper, HallPage, Results} from './components'

/**
 * COMPONENT
 */
const Routes = () => {
  return (
    <Switch>
      {/* Routes placed here are available to all visitors */}
      <Route exact path="/" component={Scraper} />
      <Route path="/hall" component={HallPage} />
      <Route path="/results" component={Results} />
    </Switch>
  )
}

export default Routes
