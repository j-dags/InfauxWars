import React from 'react'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
import {Router} from 'react-router-dom'
import history from './history'
import store from './store'
import App from './app'
import {FlexCol, Navbar} from './components'
import { CounterContextProvider } from './components/Context'


ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <CounterContextProvider>
        <FlexCol>
          <Navbar />
          <App />
        </FlexCol>
      </CounterContextProvider>
    </Router>
  </Provider>,
  document.getElementById('app')
)
