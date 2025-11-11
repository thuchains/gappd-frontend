import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import PostCard from '../../components/PostCard/PostCard'

const timeAgo = (dateString) => {
  const then = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now - then) / 1000)
  if (Number.isNaN(seconds)) {
    return ""
  }
  if (seconds < 10) {
    return "just now"
  }
  if (seconds < 60) {
    return `${seconds}s ago`
  }
  const minutes = Math.floor(seconds/60)
  if (minutes < 60) {
    return `${minutes}m ago`
  }
  const hours = Math.floor(minutes/60)
  if (hours < 24) {
    return `${hours}h ago`
  }
  const days = Math.floor(hours/24)
  if (days < 7) {
    return `${days}d ago`
  }
  return then.toLocaleDateString()
}


const HomeView = () => {
  const { API_URL, token } = useAuth()
  const sentinelRef = useRef(null) //got from internet
  const abortRef = useRef(null)
  const location = useLocation()
  // const [items, setItems] = useState([])
  // const [loading, setLoading] = useState(false)

  const [feed, setFeed] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState("")
  const [loadingMore, setLoadingMore] = useState(false)

  const headers = useMemo(
    () => (token ? { Authorization: `Bearer ${token}`}: {}

  ),[token])

  const loadFeed =  useCallback(async () => {
    setError("")
    try {
      const response = await fetch (`${API_URL}/posts/feed`, { headers })
      if (!response.ok) {
        throw new Error(`Feed failed (${response.status})`)
      }
      const data = await response.json()
      const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []
      setFeed(items)
      setPage(1)
      const totalPages = data?.pages ?? (items.length ? 2: 1)
      setHasMore(1 < totalPages)
    } catch (e) {
      setError(e.message || "Failed to load feed")
      setFeed([])
      setHasMore(false)
    }
  }, [API_URL, headers])

  const fetchPage = useCallback(async(nextPage = 1, append = false) => {
    if (loadingMore || !hasMore && append) {
      return
    }
    setError("")
    if (append) {
      setLoadingMore(true)
      setError("")
    }
    if (abortRef.current) {
      abortRef.current.abort()
    }
    abortRef.current = new AbortController()

    try {
      const url = `${API_URL}/posts/feed?page=${nextPage}`
      const response = await fetch(url, { headers, signal: abortRef.current.signal })
      if (!response.ok) {
        throw new Error(`Feed request failed (${response.status})`)
      }
      const data = await response.json()

      const items = Array.isArray(data?.items) ? data.items : []
      const totalPages = data?.pages ?? (items.length ? nextPage + 1 : nextPage)
      const more = nextPage < totalPages

      setFeed((prev) => (append ? [...prev, ...items] : items))
      setHasMore(more)
      setPage(nextPage)
    } catch (e) {
      if (e.name !== "AbortError") {
        setError(e.message || "Failed to load feed.")
      }
    } finally {
      setLoadingMore(false)
    }
  }, [API_URL, headers, hasMore, loadingMore])

  //initial mount
  useEffect(() => {
    setFeed([]);
    setPage(1);
    loadFeed(),
    setHasMore(true);
    setError("");
  }, [API_URL, token, loadFeed])

  useEffect(() => {
    if (location.state?.refresh) {
      loadFeed()
    }
  }, [location.state?.refresh, loadFeed])

  //inifinite scroll
  useEffect(() => {
    if (!sentinelRef.current || !feed.length) {
      return
    }
    const el = sentinelRef.current

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (!entry.isIntersecting) {
        return
      }
      if (hasMore && !loadingMore) {
        fetchPage(page + 1, true)
      }
    }, { root: null, rootMargin: "300px", threshold: 0 })
    observer.observe(el)
    return () => observer.unobserve(el)
  }, [page, hasMore, loadingMore, feed.length, fetchPage])

  const toggleLike = async (postId, alreadyLiked) => {
    setFeed((prev) => prev.map((p) => p.id === postId ? {...p, liked: !alreadyLiked, likes_count: (p.likes_count || 0) + (alreadyLiked ? 1 : -1)} : p))
    try {
      const response = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: "POST",
        headers
      })
      if (!response.ok) {
        throw new Error("Like failed")
      }
    } catch {
      setFeed((prev) => prev.map((p) => p.id === postId ? {...p, liked: alreadyLiked, likes_count: (p.likes_count || 0) + (alreadyLiked ? 0 : -1) + (alreadyLiked ? 0 : 0)} : p))
    }
  }

  const addComment = async (postId, text) => {
    setFeed((prev) => prev.map((p) => p.id === postId ? {...p, comments_count: (p.comments_count || 0) + 1} : p))
  }

  return (
    <>
      <div>
        {error && (<div>{error}</div>)}
        {!feed.length && !error ? (
          <div>
            <p>Your feed is empty</p>
            <p>Follow people or create a post to see content here.</p>
          </div>
        ): null}
        <ul>
          {feed.map((post) => (
            <li key={post.id}>
              <PostCard post={post} timeago={timeAgo} onLike={() => toggleLike(post.id, !!post.liked)} onAddComment={(id, text) => addComment(id, text)} mapUser={(u) => ({username: u?.username, firstName: u?.first_name, lastName: u?.last_name})}/>
            </li>
          ))}
        </ul>
          <div ref={sentinelRef} />
          {loadingMore && <p>Loading...</p>}
          {!hasMore && feed.length > 0 && (
            <p>You're all caught up!</p>
          )}

      </div>
    </>
  )
}

export default HomeView