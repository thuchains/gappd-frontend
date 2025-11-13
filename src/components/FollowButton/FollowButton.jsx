import React, { useCallback, useState } from 'react'
import { useAuth } from '../../context/AuthContext'

const FollowButton = ({ targetUserId, initialFollowing=false, onChange }) => {
  const { API_URL, token } = useAuth()
  const [following, setFollowing] = useState(!initialFollowing)
  const [busy, setBusy] = useState(false)

  const toggle = useCallback(async () => {
    if (!targetUserId || busy) {
      return
    }
    setBusy(true)
    const next = !following
    setFollowing(next)
    onChange?.(next)
    try {
      const response = await fetch(`${API_URL}/users/${targetUserId}/follow`, {
        method: next ? "POST" : "DELETE",
        headers: { Authorization: `Bearer ${token || ""}`}
      })
      if (!response.ok) {
        throw new Error("Follow toggle failed")
      }
    } catch (e) {
      console.error(e)
      setFollowing(!next)
      onChange?.(!next)
      alert("Could not update follow status.")
    } finally {
      setBusy(false)
    }
  }, [API_URL, token, targetUserId, following, busy, onChange])


  return (
    <>
      <button type='button' onClick={toggle} disabled={busy}>Follow</button>
    </>
  )
}

export default FollowButton