import React, { createContext, useContext, useState, useEffect } from "react";
import App from "../App";

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext)
    return context
}

const API_URL = import.meta.env.VITE_API_URL || 'https://gappd-backend.onrender.com'
const TOKEN_KEY = 'gappd_token'
const USER_KEY = 'gappd_user'

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null)
    const [user, setUser] = useState(() => {
        const cached = localStorage.getItem(USER_KEY)
        return cached ? JSON.parse(cached) : null
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (token) {
            localStorage.setItem(TOKEN_KEY, token)
        } else {
            localStorage.removeItem(TOKEN_KEY)
        }
    }, [token])

    useEffect(() => {
        if (user) {
            localStorage.setItem(USER_KEY, JSON.stringify(user))
        } else {
            localStorage.removeItem(USER_KEY)
        }
    }, [user])

    useEffect(() => {
        (async () => {
            if (!token) {
                setLoading(false)
                return
            }
            try {
                const response = await fetch(`${API_URL}/users/me`, {
                    headers: { Authorization: `Bearer ${token}`}
                })
                if (response.status === 401) {
                    setToken(null)
                    setUser(null)
                } else if (response.ok) {
                    const currentUser = await response.json().catch(() => null)
                    setUser(currentUser || null)
                } else {
                    setToken(null)
                    setUser(null)
                }
            } catch {
                setToken(null)
                setUser(null)
            } finally {
                setLoading(false)
            }
        })() //calls function
    }, [token])

    
    const login = async ({ email, password }) => {
        const response = await fetch(`${API_URL}/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        })
        const data = await response.json().catch(() => ({}))
        
        if (!response.ok) {
            if (response.status == 401 || response.status === 403) {
                throw new Error("Invalid email or password.")
            }
            throw new Error(data?.message || `Login failed (${response.status})`)
        }

        const t = data?.access_token || data?.token
        
        if (!t) {
            throw new Error("No token returned from server")
        } 
        setToken(t)

        const currentUserResponse = await fetch(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${t}` }
        })
        if (currentUserResponse.ok) {
            const currentUser = await currentUserResponse.json().catch(() => null)
            setUser(currentUser || null)
        } else {
            setUser(null)
        }
    } 

    const register = async (payload) => {
        const response = await fetch(`${API_URL}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
            if (response.status === 409) {
                throw new Error(data?.message || "Email or username already taken.")
            }
            throw new Error(data?.message || `Registration failed (${response.status})`)
        }
        return data
    }

    const updateUser = async (payload) => {
        if (!token) {
            throw new Error("Not authorized")
        }
        const response = await fetch(`${API_URL}/users/me`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload || {})
        })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
            if (response.status === 401) {
                setToken(null)
                setUser(null)
                throw new Error("Session expired.")
            }
            throw new Error(data?.message || `Update failed (${response.status})`)
        }
        if (data && Object.keys(data).length) {
            setUser(data)
            return data
        } else {
            try {
                const currentUserResponse = await fetch(`${API_URL}/users/me`, {
                    headers: {Authorization: `Bearer ${token}`}
                })
                const currentUser = currentUserResponse.ok ? await currentUserResponse.json().catch(() => null) : null
                setUser(currentUser || user)
                return currentUser || user
            } catch {
                return user
            }
        }
        
    }

    const updateProfilePicture = async (file) => {
        if (!token) {
            throw new Error("Not authorized")
        }
        if (!file) {
            throw new Error("No file selected")
        }
        const form = new FormData()
        form.append("photo", file)
        const response = await fetch(`${API_URL}/users/me/avatar`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`},
            body: form
        })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
            if (response.status === 401) {
                setToken(null)
                setUser(null)
                throw new Error("Session expired. Please login again")
            }
            throw new Error(data?.message || `Avatar upload failed (${response.status})`)
        }

        try {
            const currentUserResponse = await fetch(`${API_URL}/users/me`, {
                headers: {Authorization: `Bearer ${token}`}
            })
            const currentUser = currentUserResponse.ok ? await currentUserResponse.json().catch(() => null) : null
            setUser(currentUser || user)
        } catch {
            return user
        }
        return true
    }
    

    const deleteUser = async () => {
        if (!token) {
            throw new Error("Not authorized")
        }
        const response = await fetch(`${API_URL}/users/me`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
            throw new Error(data?.message || `Delete failed (${response.status})`)
        }
        setToken(null)
        setUser(null)
        return true 
    }

    const logout = () => {
        setToken(null)
        setUser(null)
    }

    const isAuthenticated = !!token && !!user

    const value = {
        API_URL,
        isAuthenticated,
        user,
        token,
        loading,
        login,
        updateUser,
        updateProfilePicture,
        logout,
        deleteUser,
        register
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}   



