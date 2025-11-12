import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const CommentList = ({ postId, allowCreate = true }) => {
  const { API_URL, token, user } = useAuth()
  const [comments, setComments] = useState([])
  const [_pending, setPending] = useState(false)
  const [text, setText] = useState("")
  const [error, setError] = useState("")

  const onLoad = useCallback(async () => {
    if (!postId) {
      return
    }
    setPending(true)
    setError("")
    try {
      const response = await fetch(`${API_URL}/comments/by-post/${postId}`, {
        headers: token ? { Authorization: `Bearer ${token}`} : {}
      })
      if (!response.ok) {
        throw new Error("Failed to laod comments")
      }
      const data = await response.json()
      setComments(Array.isArray(data) ? data : data.items ?? [])
    } catch (e) {
      console.error(e)
      setError("Could not load comments")
    } finally {
      setPending(false)
    }
  }, [API_URL, postId, token])

  useEffect(() => {
    onLoad()
  }, [onLoad])

  const onSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!text.trim()) {
      return
    }
    try {
      const response = await fetch(`${API_URL}/comments/by-post/${postId}`, {
        method: "POST",
        headers: {"Content-Type": "application/json", Authorization: `Bearer ${token || ""}`,},
        body: JSON.stringify({ text: text.trim()})
    })
    if (!response.ok) {
      throw new Error("Failed to add comment")
    }
    setText("")
    onLoad()
  } catch (e) {
    console.error(e)
    alert("Failed to add comment")
  }
}, [API_URL, text, postId, token, onLoad])

  return (
    <>
      <div className="comment-list">
        {error && <div className="comment-error">{error}</div>}
        {allowCreate && user && (
          <form onSubmit={onSubmit} className="comment-form">
            <input className="add-comment-input" type="text" placeholder='Add a comment...' value={text} onChange={(e) => setText(e.target.value)} />
            <button className="post-comment-btn" type='submit' disabled={!text.trim()}>Post</button>
          </form>
        )}
        <ul>
          {comments.map((c) => (
            <li key={c.id} className="comment-item">
              <Link to={`/profile/${c.author?.username ?? c.username ?? "unknown"}`} className="comment-author">
                {c.author?.username ?? c.username ?? "unknown"}
              </Link>
              <span className="comment-text">: {c.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default CommentList