import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const CommentList = ({ postId, allowCreate = true }) => {
  const { API_URL, token, user } = useAuth()
  const [comments, setComments] = useState([])
  const [_pending, setPending] = useState(false)
  const [text, setText] = useState("")
  const [error, setError] = useState("")

  // const onLoad = useCallback(async () => {
  //   if (!postId) {
  //     return
  //   }
  //   setPending(true)
  //   setError("")
  //   try {
  //     const response = await fetch(`${API_URL}/comments/by-post/${postId}`, {
  //       headers: token ? { Authorization: `Bearer ${token}`} : {}
  //     })
  //     if (!response.ok) {
  //       throw new Error("Failed to laod comments")
  //     }
  //     const data = await response.json()
  //     setComments(Array.isArray(data) ? data : data.items ?? [])
  //   } catch (e) {
  //     console.error(e)
  //     setError("Could not load comments")
  //   } finally {
  //     setPending(false)
  //   }
  // }, [API_URL, postId, token])

  const onLoad = useCallback(async () => {
    if (!postId) {
      return
    }
    setPending(true)
    setError("")
    try {
      const url = `${API_URL}/comments/by-post/${postId}`
      console.log('[CommentList] Fetching comments from:', url)

      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })

      if (!response.ok) {
        const bodyText = await response.text().catch(() => '')
        console.error(
          '[CommentList] Failed to load comments:',
          response.status,
          response.statusText,
          bodyText
        )
        throw new Error('Failed to load comments')
      }

      const data = await response.json()
      console.log('[CommentList] Loaded comments data:', data)
      console.log('[CommentList] Data type:', typeof data, 'Is array:', Array.isArray(data))
      if (Array.isArray(data) && data.length > 0) {
        console.log('[CommentList] First comment structure:', data[0])
      }

      setComments(Array.isArray(data) ? data : data.items ?? [])
    } catch (e) {
      console.error('[CommentList] Error during onLoad:', e)
      setError('Could not load comments')
    } finally {
      setPending(false)
    }
  }, [API_URL, postId, token])

  useEffect(() => {
    onLoad()
  }, [onLoad])

//   const onSubmit = useCallback(async (e) => {
//     e.preventDefault()
//     const trimText = text.trim() 
//     if (!trimText) {
//       return
//     }
//     try {
//       const response = await fetch(`${API_URL}/comments/by-post/${postId}`, {
//         method: "POST",
//         headers: {"Content-Type": "application/json", Authorization: `Bearer ${token || ""}`,},
//         body: JSON.stringify({ text: text.trim()})
//     })
//     if (!response.ok) {
//       throw new Error("Failed to add comment")
//     }
//     setText("")
//     onLoad()
//   } catch (e) {
//     console.error(e)
//     alert("Failed to add comment")
//   }
// }, [API_URL, text, postId, token, onLoad])

  const onSubmit = useCallback(async (e) => {
    e.preventDefault()
    const trimmedText = text.trim()
    if (!trimmedText) return

    try {
      const url = `${API_URL}/comments/by-post/${postId}`
      console.log('[CommentList] Posting comment to:', url)

      const response = await fetch(url, {
        method: "POST",
        headers: {"Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}),},
        body: JSON.stringify({ text: trimmedText }),
      })

      if (!response.ok) {
        const bodyText = await response.text().catch(() => "")
        console.error(
          "[CommentList] Failed to add comment:",
          response.status,
          response.statusText,
          bodyText
        )
        throw new Error("Failed to add comment")
      }
      setText("")
      onLoad()
    } catch (e) {
      console.error("[CommentList] Error during onSubmit:", e)
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
          {comments.map((c) => {
            const commentText = c.text ?? c.comment ?? ""
            const authorUsername = c.author?.username ?? c.user?.username ?? c.username ?? "unknown"
            const userId = c.user?.id ?? c.user_id ?? "unknown"
            return (
              <li key={c.id} className="comment-item">
                <Link to={`/profile/${authorUsername}`} className="comment-author">
                  {authorUsername}
                </Link>
                <span className="comment-text">: {commentText}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}

export default CommentList