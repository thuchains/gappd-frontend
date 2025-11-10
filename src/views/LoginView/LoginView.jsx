import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'


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
        const body = {
            email: email.trim().toLowerCase(),
            password
        }
        try {
            await login(body)
            navigate("/home", { replace: true })
        } catch (e) {
            console.error(e)
            setError( typeof e.data === "object" && e.data ? JSON.stringify(e.data) : e?.data?.message || "login failed")
        } finally {
            setLoading(false)
        }
    }
    
  return (
    <div className="login-view">
        <div className="card">
            <h2>User Login</h2>
            {error && <div className="error">{error}</div>}

            <form onSubmit={onSubmit} className="login-form">
                <input type="email" name="email" placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} autoComplete='email' required/>
                <input type="password" name="password" placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} autoComplete='current-password' required/>
                <button type='submit' disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
            </form>
        </div>
    </div>
  )
}

export default LoginView