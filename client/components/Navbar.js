import React from 'react'
import {Link} from 'react-router-dom'
import {FlexCol, FlexRow} from '../components'

const Navbar = () => {
  const handleClick = () => {
    if (window.location.pathname === '/') window.location.reload(false)
  }
  return (
    <nav onClick={handleClick}>
      <FlexCol>
        <FlexRow>
          <Link to="/">
            <div className="nav-link">Home</div>
          </Link>
          <Link href="style.css" to="/hall">
            <div className="nav-link" style={{marginLeft: '1rem'}}>
              Hall of Fame
            </div>
          </Link>
        </FlexRow>
        <Link to="/">
          <h1 className="link">Infaux Wars</h1>
        </Link>
      </FlexCol>
    </nav>
  )
}

export default Navbar
