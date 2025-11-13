import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Navigate, useNavigate, Outlet } from 'react-router-dom'
import { useRef } from 'react'
import './SettingsView.css'
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle'

const SettingsView = () => {
  const { logout, user, updateUser, updateProfilePicture, deleteUser, API_URL, token } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [ok, setOk] = useState("")
  
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  
  const fileInputRef = useRef(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState("")
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState("")
  const [avatarOk, setAvatarOk] = useState("")


  const [confirmDelete, setConfirmDelete] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || ""), 
      setLastName(user.last_name || ""), 
      setUsername(user.username || ""), 
      setBio(user.bio || ""), 
      setEmail(user.email || ""), 
      setPassword("") 
    }
  }, [user])

  const currentAvatarUrl = useMemo(() => {
    if (!user?.id) {
      return ''
    }
    const version = user.profile_photo_id ? `?version=${user.profile_photo_id}` : ""
    return `${API_URL}/users/${user.id}/avatar${version}`
  }, [API_URL, user?.id, user?.profile_photo_id])

  const onSaveProfile = async (e) => {
    e.preventDefault()
    if (saving) {
      return
    }
    setError("")
    setOk("")
    setSaving(true)
    try {
      const payload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: username.trim(),
        email: email.trim(),
        bio
      }
      if (password.trim()) {
        payload.password = password.trim()
      }
      await updateUser(payload)
      setOk("Profile updated")
      setPassword("")
    } catch (e) {
      setError(e.message || "Failed to update profile.")
    } finally {
      setSaving(false)
    }
  }

  const onPickAvatar = (e) => {
    const file = e.target.files?.[0] || null
    setAvatarError("")
    setAvatarOk("")
    setAvatarFile(file)
    if (file) {
      const url = URL.createObjectURL(file)
      setAvatarPreview(url)
    } else {
      setAvatarPreview("")
    }
  }

  const onUploadAvatar = async (e) => {
    e.preventDefault()
    if (!avatarFile || savingAvatar) {
      if (!avatarFile) {
        setAvatarError("Please choose an image.")
      }
      return
    }
    setAvatarError("")
    setAvatarOk("")
    setSavingAvatar(true)
    try {
      await updateProfilePicture(avatarFile)
      setAvatarOk("Profile picture updated.")
      setAvatarFile(null)
       setAvatarPreview("")
       if (fileInputRef.current) {
        fileInputRef.current.value = ""
       }
    } catch (e) {
      setAvatarError(e.message || "Failed to upload profile picture.")
    } finally {
      setSavingAvatar(false)
    }
  }

  const onDelete = async () => {
    if (confirmDelete !== "DELETE") {
      setDeleteError("Type DELETE (all caps) to confirm.")
      return
    }
    setDeleteError("")
    setDeleting(true)
    try {
      await deleteUser()
      navigate("/login", { replace: true })
    } catch (e) {
      setDeleteError(e.message || "Failed to delete account.")
      setDeleting(false)
    }
  }

  const onLogout = () => {
    logout()
    navigate("/login", { replace: true })
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  return (
    <>
      <div className="settings-view-container">
        <div className="settings-view-content">
          <h1>Settings</h1>
          
          <section className="settings-section">
            <h2>Profile Picture</h2>
            <div className="avatar-preview-container">
              <div className="avatar-display">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="New avatar" />
                )
                :
                currentAvatarUrl ? (
                  <img src={currentAvatarUrl} alt='Current avatar'/>
                )
                :
                (<div className="avatar-display-empty">
                  <p>No image</p>
                </div>
                )}
              </div>
              <div className="avatar-controls">
                <label className="avatar-input-label">
                  📁 Change photo
                  <input type="file" ref={fileInputRef} accept='image/*' onChange={onPickAvatar} />
                </label>
                <div className="avatar-buttons">
                  <button onClick={onUploadAvatar} disabled={savingAvatar}>{savingAvatar ? "Uploading..." : "Upload"}</button>
                  {avatarPreview && (
                    <button type='button' className="secondary" onClick={() => {setAvatarFile(null); setAvatarPreview(""); setAvatarError(""); setAvatarOk(""); if (fileInputRef.current) fileInputRef.current.value = ""}}>Clear</button>
                  )}
                </div>
              </div>
            </div>
            {avatarError && <div className="message-box error">{avatarError}</div>}
            {avatarOk && <div className="message-box success">{avatarOk}</div>}
          </section>

          <section className="settings-section">
            <h2>Appearance</h2>
            <div className="appearance-controls">
              <p className="appearance-label">Theme</p>
              <ThemeToggle />
            </div>
          </section>

          <section className="settings-section">
            <h2>Profile Information</h2>
            <form onSubmit={onSaveProfile} className="settings-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input type="text" id="firstName" name='firstName' placeholder="Your first name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input type="text" id="lastName" name="lastName" placeholder="Your last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input type="text" id="username" name='username' placeholder="Your unique username" value={username} onChange={(e) => setUsername(e.target.value)}/>
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name='email' placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <input type="text" id="bio" name='bio' value={bio} onChange={(e) => setBio(e.target.value)} placeholder='Tell people about yourself...'/>
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name='password' placeholder="Leave blank to keep current password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div>
                <button type='submit' disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
              </div>
              {error && <div className="message-box error">{error}</div>}
              {ok && <div className="message-box success">{ok}</div>}
            </form>
          </section>

          <section className="settings-section">
            <h2>Delete Account</h2>
            <div className="delete-warning">
              ⚠️ Deleting your account is permanent and cannot be undone. All your posts, events, and profile data will be deleted.
            </div>
            <div className="delete-confirmation">
              <input type="text" placeholder='Type "DELETE" (all caps) to confirm' value={confirmDelete} onChange={(e) =>setConfirmDelete(e.target.value)} />
              <button className="delete-button" onClick={onDelete} disabled={deleting}>{deleting ? "Deleting..." : "Delete Account"}</button>
            </div>
            {deleteError && <div className="message-box error">{deleteError}</div>}
          </section>

          <div className="settings-actions">
            <button className="secondary" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </div>
    </>
  )
}

export default SettingsView