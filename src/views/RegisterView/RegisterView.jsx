import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const RegisterView = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { register, login } = useAuth()

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    dob: ""
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const validate = () => {
    if (!form.firstName.trim()) {
      return "First name is required"
    }
    if (!form.lastName.trim()) {
      return "Last name is required"
    } 
      
    if (!form.username.trim()) {
      return "Username is required"
    } 
    if (!form.email.trim()) {
      return "Email is required"
    } 
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {//grabbed from internet
      return "Enter a valid email" 
    } 
    if (!form.password) {
      return "Password is required"
    } 
    if (form.password.length < 8) {
      return "Password must be at least 8 characters"
    } 
    if (!form.dob) {
      return "Date of birth is required"
    } 

    try {
      const today = new Date();
      const dob = new Date(form.dob);
      const age = today.getFullYear() - dob.getFullYear() - (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);
      if (age < 13) {
        return "You must be at least 13 years old."
      }
    } catch {
      return "Invalid date of birth.";
    }
    return "";
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError("")

    const v = validate()
    if (v) {
      setError(v)
      return
    }
    try {
      setSubmitting(true)

      const payload = {
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password.trim(),
        dob: form.dob.trim(),
      }
      await register (payload)
      await login({ email: payload.email, password: payload.password })

      const from = location.state?.from?.pathname || '/home'
      navigate(from, { replace: true })
    } catch (error) {
      setError(error.message || "Registeration failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div>
        <form onSubmit={onSubmit}>
          <div className='name-container'>
            <div>
              <label htmlFor="firstName">First Name</label>
              <input type="text" id='firstName' name='firstName' value={form.firstName} onChange={(e) => setForm((f) => ({...f, firstName: e.target.value}))}/>
            </div>
            <div>
              <label htmlFor="lastName">Last Name</label>
              <input type="text" id='lastName' name='lastName' value={form.lastName} onChange={(e) => setForm((f) => ({...f, lastName: e.target.value}))}/>
            </div>
          </div>
          <div className='username-container'>
            <label htmlFor="username">Username</label>
            <input type="text" id='username' name='username' value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value}))}/>
            <p>3-20 characters (letters, numbers, underscores. Must be unique)</p>
          </div>
          <div className='email-container'>
            <label htmlFor="email">Email</label>
            <input type="email" name='email' value={form.email} onChange={(e) => setForm((f) => ({...f, email: e.target.value}))}/>
          </div>
          <div className='password-container'>
            <div>
              <label htmlFor="password">Password</label>
              <input type="password" name="password" id="password" value={form.password} onChange={(e) => setForm((f) => ({...f, password: e.target.value}))}/>
              <p>Must be at least 8 characters.</p>
            </div>
          </div>
          <div className='dob-container'>
            <label htmlFor="dob">Date of Birth</label>
            <input type="date" name="dob" id="dob" value={form.dob} onChange={(e) => setForm((f) => ({...f, dob: e.target.value}))} />
          </div>
          <p>By signing up, you agree to our Terms, Privacy Policy and Cookies Policy.</p>
          <button type='submit' disabled={submitting}>Create Account</button>
        </form>
        <div className='login'>
          <p>Have an account?{" "}
          <Link to="/login">Log in</Link>
          </p>

          {error ? (<div>{error}</div>) : null}
        </div>
      </div>
    </>
  )
}

export default RegisterView