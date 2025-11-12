import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import './LoginView.css'


const LoginView = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const { login } = useAuth()
    const navigate = useNavigate()
    
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const onSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            await login({email: email.trim().toLowerCase(), password})
            navigate("/home", { replace: true })
        } catch (e) {
            const message = 
                (e && typeof e.message === "string" && e.message) || (typeof e === "string" ? e: "Login failed")
                 
            console.error("LoginView onSubmit error: ", e)
            setError(message)
            
            // setError( typeof e.data === "object" && e.data ? JSON.stringify(e.data) : e?.data?.message || "login failed")
        } finally {
            setLoading(false)
        }
    }
    
  return (
    <div className="login-view-container">
        <div className="login-view-card">
            <h2>Sign In</h2>
            {error && <div className="login-error">{error}</div>}

            <form onSubmit={onSubmit} className="login-form">
                <input type="email" name="email" placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} autoComplete='email' required/>
                <input type="password" name="password" placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} autoComplete='current-password' required/>
                <button type='submit' disabled={loading}>{loading ? "Signing in..." : "Sign In"}</button>
            </form>

            <div className="login-link">
              Don't have an account? <a href="/register">Sign up</a>
            </div>
        </div>
    </div>
  )
}

export default LoginView