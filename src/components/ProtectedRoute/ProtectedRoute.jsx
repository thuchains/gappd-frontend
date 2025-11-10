import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
    const { token, loading } = useAuth()
    if (loading) {
        return <div>Loading...</div> 
    }
    if (!token) {
        return <Navigate to="/login" replace />
    }
    return children
}