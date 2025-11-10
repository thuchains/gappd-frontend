import React from 'react'
import { NavLink } from 'react-router-dom'
import './NavBar.css'

const NavBar = () => {
  return (
    <>
      
      <nav>
        <div className='logo'>
          <h1>Gapp'd</h1>
        </div>
        <ul className='nav-links'>
            <li><NavLink to='/' className={({isActive}) => isActive ? 'active' : ''}>Home</NavLink></li>
            <li><NavLink to='/login' className={({isActive}) => isActive ? 'active' : ''}>Login</NavLink></li>
            <li><NavLink to='/register' className={({isActive}) => isActive ? 'active' : ''}>Register</NavLink></li>
            <li><NavLink to='/explore/events' className={({isActive}) => isActive ? 'active' : ''}>Explore Events</NavLink></li>
            <li><NavLink to='/create' className={({isActive}) => isActive ? 'active' : ''}>Create</NavLink></li>
            <li><NavLink to='/profile' className={({isActive}) => isActive ? 'active' : ''}>Profile</NavLink></li>
        </ul>
      </nav>
    </>
  )
}

export default NavBar