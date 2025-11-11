import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Navigate, useNavigate, Outlet } from 'react-router-dom'
import { useRef } from 'react'

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
      <div>
        <h1>Settings</h1>
        <section>
          <h2>Profile Picture</h2>
          <div>
            <div>
              {avatarPreview ? (
                <img src={avatarPreview} alt="New avatar" />
              )
              :
              currentAvatarUrl ? (
                <img src={currentAvatarUrl} alt='Current avatar'/>
              )
              :
              (<div>
                <p>No image</p>
              </div>
              )}
            </div>
            <div>
              <input type="file" ref={fileInputRef} accept='image/*' onChange={onPickAvatar} />
              <div>
                <button onClick={onUploadAvatar} disabled={savingAvatar}>Upload</button>
                {avatarPreview && (
                  <button type='button' onClick={() => {setAvatarFile(null); setAvatarPreview(""); setAvatarError(""); setAvatarOk(""); if (fileInputRef.current) fileInputRef.current.value = ""}}>Clear</button>
                )}
              </div>
            </div>
          </div>
          {avatarError && <div>{avatarError}</div>}
          {avatarOk && <div>{avatarOk}</div>}
        </section>
        <section>
          <h2>Profile</h2>
          <form onSubmit={onSaveProfile}>
            <div>
              <div>
                <label htmlFor="firstName">First Name</label>
                <input type="text" name='firstName' value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div>
                <label htmlFor="lastName">Last Name</label>
                <input type="text" name="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div>
              <label htmlFor="username">Username</label>
              <input type="text" name='username' value={username} onChange={(e) => setUsername(e.target.value)}/>
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <input type="email" name='email' value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input type="password" name='password' value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div>
              <label htmlFor="bio">Bio</label>
              <input type="text" name='bio' value={bio} onChange={(e) => setBio(e.target.value)} placeholder='Tell people about yourself...'/>
            </div>
            <div>
              <button type='submit' disabled={saving}>Save Changes</button>
            </div>
            {error && <div>{error}</div>}
            {ok && <div>{ok}</div>}
          </form>
        </section>
        <section>
          <h2>Delete Account</h2>
          <p>Deleting your account is permanent. This cannot be undone.</p>
          <div>
            <input type="text" placeholder='Type DELETE to confirm' value={confirmDelete} onChange={(e) =>setConfirmDelete(e.target.value)} />
            <button onClick={onDelete} disabled={deleting}>Delete Account</button>
          </div>
          {deleteError && <div>{deleteError}</div>}
        </section>
        <div>
          <button onClick={onLogout}>Logout</button>
        </div>
      </div>

    </>
  )
}

export default SettingsView