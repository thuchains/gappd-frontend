import React, { useCallback, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import './LikeButton.css'

const LikeButton = ({ postId, initialCount = 0, initialLiked = false, onChange }) => {
  const { API_URL, token } = useAuth()
  const [liked, setLiked] = useState(!!initialLiked)
  const [count, setCount] = useState(Number(initialCount) || 0)
  const [busy, setBusy] = useState(false)
  
  const toggle = useCallback(async () => {
    if (!postId || busy) {
      return
    }
  setBusy(true)
  const nextLiked = !liked
  const delta = nextLiked ? 1 : -1
  // optimistic update
  setLiked(nextLiked)
  setCount((c) => Math.max(0, c + delta))
  const nextCount = Math.max(0, count + delta)
  onChange?.({ liked: nextLiked, count: nextCount })
    try {
      const response = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: nextLiked ? "POST" : "DELETE",
        headers: { Authorization: `Bearer ${token || ""}`}
      })
      if (!response.ok) {
        throw new Error("Like toggle failed")
      }
    } catch (e) {
      console.error(e)
  // rollback
  setLiked(!nextLiked)
  setCount((c) => Math.max(0, c - delta))
  onChange?.({ liked: !nextLiked, count: Math.max(0, count - delta) })
      alert("Like not updated")
    } finally {
      setBusy(false)
    }
  }, [API_URL, token, postId, liked, busy, onChange, count])

  return (
    <>
      <button
        type='button'
        onClick={toggle}
        disabled={busy}
        aria-pressed={liked}
        className={`like-btn ${liked ? 'liked' : ''}`}
        aria-label={liked ? 'Unlike' : 'Like'}
      >
        <span aria-hidden>{liked ? '♥' : '♡'}</span>
        <span className="like-count">{count > 0 ? count : ''}</span>
      </button>
    </>
  )
}

export default LikeButton