import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom' 
import HomeView from './views/HomeView/HomeView'
import LoginView from './views/LoginView/LoginView'
import RegisterView from './views/RegisterView/RegisterView'
import SettingsView from './views/SettingsView/SettingsView'
import ExploreEventsView from './views/ExploreEventsView/ExploreEventsView'
import ProfileView from './views/ProfileView/ProfileView'
import CreateView from './views/CreateView/CreateView'
import NotificationView from './views/NotificationView/NotificationView'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import EventDetailView from './views/EventDetailView/EventDetailView'
import NavBar from './components/NavBar/NavBar'

const RootPath = () => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/home" replace /> : <LoginView />
}


function App() {
  const { token } = useAuth()
  
  return (
    <>
      <BrowserRouter>
      {token && <NavBar />}
        <Routes>
          <Route path='/' element={<RootPath/>}/>
          <Route path='/login' element={<LoginView/>}/>
          <Route path='/register' element={<RegisterView/>}/>
          <Route path='/explore/events' element={<ExploreEventsView/>}/>
          <Route path='/events/:id' element={<EventDetailView/>}/>
          <Route path='/profile/:username' element={<ProfileView/>}/>
          <Route path='/home' element={<ProtectedRoute><HomeView/></ProtectedRoute>}/>
          <Route path='/settings' element={<ProtectedRoute><SettingsView/></ProtectedRoute>}/>
          <Route path='/create' element={<ProtectedRoute><CreateView/></ProtectedRoute>}/>
          <Route path='/notifications' element={<ProtectedRoute><NotificationView/></ProtectedRoute>}/>
        </Routes>

      </BrowserRouter>
    </>
  )
}

export default App
