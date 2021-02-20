import React from 'react'
import {Route, Switch} from 'react-router-dom'
import {Scraper, HallPage} from './components'

/**
 * COMPONENT
 */
const Routes = () => {
  return (
    <Switch>
      {/* Routes placed here are available to all visitors */}
      <Route exact path="/" component={Scraper} />
      <Route path="/hall" component={HallPage} />
    </Switch>
  )
}

export default Routes
