import React from 'react'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
import {Router} from 'react-router-dom'
import history from './history'
import store from './store'
import App from './app'
import {FlexCol, Navbar} from './components'

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <FlexCol>
        <Navbar />
        <App />
      </FlexCol>
    </Router>
  </Provider>,
  document.getElementById('app')
)
