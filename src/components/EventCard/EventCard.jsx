import React, { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import Avatar from '../Avatar/Avatar'

const EventCard = ({ event, onEdit, onDelete, onShare, showActions = true}) => {
  const navigate = useNavigate()
  const { API_URL, user, token } = useAuth()
  const host = useMemo(() => {
    if (event?.host) {
      return event.host
    }
    if (Array.isArray(event?.hosts) && event.hosts.length) {
      return event.hosts[0]
    }
    if (event?.user) {
      return event.user
    }
    return {
      id: event?.user_id,
      username: event?.username
    }
  }, [event])

  const isOwner = useMemo(() => {
    if (!user) {
      return false
    }
    const ownerId = host?.id ?? event?.user_id
    return String(ownerId ?? "") === String(user.id ?? "")
  }, [host?.id, event?.user_id, user])

  const coverSrc = useMemo(() => {
    if (event?.cover_photo_url && /^https?:\/\//i.test(event.cover_photo_url)) {
      return event.cover_photo_url;
    }
    if (event?.cover_photo_id) {
      return `${API_URL}/photos/${event.cover_photo_id}`;
    }
    return ""
  }, [API_URL, event?.cover_photo_url, event.cover_photo_id])

  const startText = useMemo(() => {
    if (!event?.start_time) {
      return ""
    }
    try {
      const date = new Date(event.start_time)
      return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
      })
    } catch {
      return String(event.start_time)
    }
  }, [event?.start_time])

  const handleOpen = useCallback(() => {
    if (event?.id) {
      navigate(`/events/${event.id}`)
    }
  }, [navigate, event?.id])

  const handleShare = useCallback(() => {
    if (onShare) {
      return onShare(event)
    }
    const url = `${window.location.origin}/events/${event.id}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    alert("Event link copied.");
  }, [onShare, event])

  const handleEdit = useCallback(() => {
    if (onEdit) onEdit(event);
    else navigate(`/events/${event.id}/edit`);
  }, [onEdit, navigate, event]);

  const handleDelete = useCallback(async () => {
    if (!event?.id) {
      return
    }
    const ok = window.confirm("Delete event?");
    if (!ok) {
      return
    }
    if (onDelete) {
      return onDelete(event.id)
    }
    try {
      const res = await fetch(`${API_URL}/events/${event.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token || ""}` },
      });
      if (!res.ok) {
        throw new Error("Delete failed")
      }
      alert("Event successfully deleted");
      navigate(0);
    } catch (e) {
      console.error(e);
      alert("Failed to delete");
    }
  }, [API_URL, token, event?.id, onDelete, navigate])


  return (
    <>
      <article data-event-id={event?.id}>
      <header>
        <Link to={`/profile/${host?.username ?? "unknown"}`} aria-label="Host profile">
          <Avatar userId={host?.id} username={host?.username ?? "user"} avatar_url={host?.avatar_url} avatar_photo_id={host?.avatar_photo_id} />
        </Link>
        <div>
          <div>
            <Link to={`/profile/${host?.username ?? "unknown"}`}>
              {host?.username ?? "unknown"}
            </Link>
            {!isOwner && host?.id && <FollowButton targetUserId={host.id} />}
          </div>
          {startText && <div>{startText}</div>}
          {(event?.location || event?.city) && (
            <div>
              {event.location ||
                [event.city, event.state, event.country].filter(Boolean).join(", ")}
            </div>
          )}
        </div>
        {isOwner && (
          <div>
            <button type="button" onClick={handleEdit}>Edit</button>
            <button type="button" onClick={handleDelete}>Delete</button>
          </div>
        )}
      </header>
      {coverSrc && (
        <section onClick={handleOpen} style={{ cursor: "pointer" }}>
          <img
            alt={event?.title ? `${event.title} cover` : "event cover"}
            src={coverSrc}
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        </section>
      )}
      {event?.title && (
        <section>
          <h3>{event.title}</h3>
        </section>
      )}
      {event?.description && (
        <section>
          <p>{event.description}</p>
        </section>
      )}
      {showActions && (
        <section>
          <button type="button" onClick={handleShare}>Share</button>
        </section>
      )}
    </article>
    </>
  )
}

export default EventCard