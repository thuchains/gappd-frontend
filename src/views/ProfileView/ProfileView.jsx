// src/views/ProfileView/ProfileView.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import "./ProfileView.css"

const PAGE_SIZE = 12
const TABS = { POSTS: "posts", EVENTS: "events" }
const emptyPage = { items: [], page: 0, pages: 0 }

export default function ProfileView() {
  const { username } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { token, user: me, API_URL, updateProfilePicture } = useAuth()

  const BASE = (API_URL || "").replace(/\/+$/,"")
  const authHeaders = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token])

  // profile state
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState("")
  const [profile, setProfile] = useState(null)

  // tabs + pagination
  const [activeTab, setActiveTab] = useState(TABS.POSTS)
  const [postsPage, setPostsPage] = useState(emptyPage)
  const [postsLoading, setPostsLoading] = useState(false)
  const [eventsPage, setEventsPage] = useState(emptyPage)
  const [eventsLoading, setEventsLoading] = useState(false)

  // observers
  const postsSentinelRef = useRef(null)
  const eventsSentinelRef = useRef(null)
  const postsIORef = useRef(null)
  const eventsIORef = useRef(null)

  const isMeRoute = useMemo(() => {
    if (!username) return false
    if (username.toLowerCase() === "me") return true
    return !!(me?.username && username === me.username)
  }, [username, me?.username])

  const isOwner = useMemo(() => {
    if (!me || !profile) return false
    return me.id === profile.id || me.username === profile.username
  }, [me, profile])

  // fetch profile
  useEffect(() => {
    let live = true
    ;(async () => {
      setUserLoading(true)
      setUserError("")
      setProfile(null)
      try {
        const path = isMeRoute ? "/users/me" : `/users/${encodeURIComponent(username)}`
        const res = await fetch(`${BASE}${path}`, { headers: { ...authHeaders } })
        if (!res.ok) {
          if (res.status === 404) throw new Error("User not found")
          if (res.status === 401) throw new Error("Please sign in to view this profile")
          throw new Error(`Failed to load profile (${res.status})`)
        }
        const data = await res.json()
        if (typeof data.is_following === "undefined") data.is_following = false
        data.counts = data.counts ?? { posts: 0, events: 0, followers: 0, following: 0 }
        if (live) setProfile(data)
      } catch (e) {
        if (live) setUserError(e?.message || "Failed to load profile")
      } finally {
        if (live) setUserLoading(false)
      }
    })()
    return () => { live = false }
  }, [BASE, username, authHeaders, isMeRoute])

  // reset pages on profile switch
  useEffect(() => {
    setPostsPage(emptyPage)
    setEventsPage(emptyPage)
  }, [username])

  const canLoadMorePosts  = postsPage.page  > 0 && postsPage.page  < postsPage.pages
  const canLoadMoreEvents = eventsPage.page > 0 && eventsPage.page < eventsPage.pages

  // loaders
  const loadPosts = useCallback(async (next = false) => {
    if (!profile || postsLoading) return
    const page = next ? postsPage.page + 1 : 1
    if (postsPage.pages && page > postsPage.pages) return
    setPostsLoading(true)
    try {
      const url = `${BASE}/posts/by-user/${profile.id}?page=${page}&per_page=${PAGE_SIZE}`
      const res = await fetch(url, { headers: { ...authHeaders } })
      if (!res.ok) throw new Error(`Failed to load posts (${res.status})`)
      const data = await res.json()
      setPostsPage(prev => (page === 1 ? data : { ...data, items: [...prev.items, ...(data.items || [])] }))
    } catch (e) {
      console.error(e)
    } finally {
      setPostsLoading(false)
    }
  }, [BASE, profile, authHeaders, postsPage.page, postsPage.pages, postsLoading])

  const loadEvents = useCallback(async (next = false) => {
    if (!profile || eventsLoading) return
    const page = next ? eventsPage.page + 1 : 1
    if (eventsPage.pages && page > eventsPage.pages) return
    setEventsLoading(true)
    try {
      // backend route prefix is event_posts
      const url = `${BASE}/events/by-username/${encodeURIComponent(profile.username)}?page=${page}&per_page=${PAGE_SIZE}`
      const res = await fetch(url, { headers: { ...authHeaders } })
      if (!res.ok) throw new Error(`Failed to load events (${res.status})`)
      const data = await res.json()
      setEventsPage(prev => (page === 1 ? data : { ...data, items: [...prev.items, ...(data.items || [])] }))
    } catch (e) {
      console.error(e)
    } finally {
      setEventsLoading(false)
    }
  }, [BASE, profile, authHeaders, eventsPage.page, eventsPage.pages, eventsLoading])

  // kick off first page for the active tab
  useEffect(() => {
    if (!profile) return
    if (activeTab === TABS.POSTS  && postsPage.page  === 0) loadPosts(false)
    if (activeTab === TABS.EVENTS && eventsPage.page === 0) loadEvents(false)
  }, [profile, activeTab, postsPage.page, eventsPage.page, loadPosts, loadEvents])

  // observers
  useEffect(() => {
    if (activeTab !== TABS.POSTS || !postsSentinelRef.current) return
    if (!canLoadMorePosts || postsLoading) return
    if (postsIORef.current) { postsIORef.current.disconnect(); postsIORef.current = null }
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || postsLoading || !canLoadMorePosts) return
      io.unobserve(postsSentinelRef.current)
      ;(async () => {
        await loadPosts(true)
        if (postsSentinelRef.current) io.observe(postsSentinelRef.current)
      })()
    }, { root: null, rootMargin: "400px 0px", threshold: 0 })
    postsIORef.current = io
    io.observe(postsSentinelRef.current)
    return () => io.disconnect()
  }, [activeTab, canLoadMorePosts, postsLoading, loadPosts])

  useEffect(() => {
    if (activeTab !== TABS.EVENTS || !eventsSentinelRef.current) return
    if (!canLoadMoreEvents || eventsLoading) return
    if (eventsIORef.current) { eventsIORef.current.disconnect(); eventsIORef.current = null }
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || eventsLoading || !canLoadMoreEvents) return
      io.unobserve(eventsSentinelRef.current)
      ;(async () => {
        await loadEvents(true)
        if (eventsSentinelRef.current) io.observe(eventsSentinelRef.current)
      })()
    }, { root: null, rootMargin: "400px 0px", threshold: 0 })
    eventsIORef.current = io
    io.observe(eventsSentinelRef.current)
    return () => io.disconnect()
  }, [activeTab, canLoadMoreEvents, eventsLoading, loadEvents])

  // follow / avatar
  const [followBusy, setFollowBusy] = useState(false)
  const onToggleFollow = async () => {
    if (!profile || followBusy || isOwner) return
    if (!token) return navigate("/login", { replace: true, state: { from: location } })
    setFollowBusy(true)
    try {
      const method = profile.is_following ? "DELETE" : "POST"
      const res = await fetch(`${BASE}/users/${profile.id}/follow`, { method, headers: { ...authHeaders } })
      if (!res.ok) throw new Error(`Follow action failed (${res.status})`)
      setProfile(p => p ? {
        ...p,
        is_following: !p.is_following,
        counts: { ...p.counts, followers: p.counts.followers + (p.is_following ? -1 : 1) }
      } : p)
    } catch (e) {
      console.error(e)
    } finally {
      setFollowBusy(false)
    }
  }

  const [avatarBusy, setAvatarBusy] = useState(false)
  const onPickAvatar = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarBusy(true)
    try {
      await updateProfilePicture(file)
      if (isOwner) {
        const res = await fetch(`${BASE}/users/me`, { headers: { ...authHeaders } })
        if (res.ok) {
          const json = await res.json().catch(() => null)
          if (json) setProfile(json)
        }
      }
    } catch (e2) {
      console.error(e2)
    } finally {
      setAvatarBusy(false)
      e.target.value = ""
    }
  }

  // ui guards
  if (userLoading) return <div className="pv-loading">Loading profile…</div>
  if (userError) {
    return (
      <div className="pv-error">
        {userError}
        <button className="btn" onClick={() => navigate(0)}>Retry</button>
      </div>
    )
  }
  if (!profile) return <div className="pv-empty">No profile</div>

  // avatar src (your backend avatar route: /users/<id>/avatar)
  const avatarSrc = `${BASE}/users/${profile.id}/avatar`

  return (
    <div className="pv-root">
      <section className="pv-header">
        <div className="pv-avatar-wrap">
          <img className="pv-avatar" src={avatarSrc} alt={`${profile.username} avatar`} />
          {isOwner && (
            <label className="pv-avatar-change">
              <input type="file" accept="image/*" onChange={onPickAvatar} disabled={avatarBusy} />
              Change
            </label>
          )}
        </div>

        <div className="pv-meta">
          <div className="pv-row">
            <h1 className="pv-username">@{profile.username}</h1>
            <div className="pv-actions">
              {isOwner ? (
                <button className="btn" onClick={() => navigate("/settings")}>Edit Profile</button>
              ) : (
                <button className="btn" disabled={followBusy} onClick={onToggleFollow}>
                  {profile.is_following ? "Unfollow" : "Follow"}
                </button>
              )}
            </div>
          </div>

          <ul className="pv-stats">
            <li><strong>{profile.counts?.posts ?? 0}</strong> Posts</li>
            <li><strong>{profile.counts?.events ?? 0}</strong> Events</li>
            <li><strong>{profile.counts?.followers ?? 0}</strong> Followers</li>
            <li><strong>{profile.counts?.following ?? 0}</strong> Following</li>
          </ul>

          {[profile.first_name, profile.last_name].filter(Boolean).length > 0 && (
            <div className="pv-fullname">
              {[profile.first_name, profile.last_name].filter(Boolean).join(" ")}
            </div>
          )}
          {profile.bio && <p className="pv-bio">{profile.bio}</p>}
        </div>
      </section>

      <nav className="pv-tabs">
        <button
          className={`pv-tab ${activeTab === TABS.POSTS ? "active" : ""}`}
          onClick={() => setActiveTab(TABS.POSTS)}
        >
          Posts
        </button>
        <button
          className={`pv-tab ${activeTab === TABS.EVENTS ? "active" : ""}`}
          onClick={() => setActiveTab(TABS.EVENTS)}
        >
          Events
        </button>
      </nav>

      {activeTab === TABS.POSTS && (
        <div className="pv-grid-wrap">
          <div className="pv-grid">
            {(postsPage.items || []).map((item) => {
              const pid = item?.photos?.[0]?.id
              const img = pid ? `${BASE}/photos/${pid}` : null
              return (
                <button
                  key={item.id}
                  className="pv-tile"
                  title={`Post ${item.id}`}
                  onClick={() => navigate(`/posts/${item.id}`)}
                >
                  {img ? (
                    <img className="pv-tile-img" src={img} alt={`Post ${item.id}`} />
                  ) : (
                    <div className="pv-tile-placeholder">No image</div>
                  )}
                </button>
              )
            })}
          </div>
          <div ref={postsSentinelRef} className="pv-sentinel" />
          {postsLoading && <div className="pv-loading-more">Loading more…</div>}
        </div>
      )}

      {activeTab === TABS.EVENTS && (
        <div className="pv-grid-wrap">
          <div className="pv-grid">
            {(eventsPage.items || []).map((item) => {
              const coverId = item?.cover_photo_id
              const img = coverId ? `${BASE}/photos/${coverId}` : null
              return (
                <button
                  key={item.id}
                  className="pv-tile"
                  title={`Event ${item.id}`}
                  onClick={() => navigate(`/events/${item.id}`)}
                >
                  {img ? (
                    <img className="pv-tile-img" src={img} alt={`Event ${item.id}`} />
                  ) : (
                    <div className="pv-tile-placeholder">No image</div>
                  )}
                </button>
              )
            })}
          </div>
          <div ref={eventsSentinelRef} className="pv-sentinel" />
          {eventsLoading && <div className="pv-loading-more">Loading more…</div>}
        </div>
      )}
    </div>
  )
}
