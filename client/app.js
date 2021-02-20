import React from 'react'

import {Navbar, FlexCol} from './components'
import Routes from './routes'

const App = () => {
  return (
    <FlexCol>
      <Navbar />
      <Routes />
    </FlexCol>
  )
}

export default App
