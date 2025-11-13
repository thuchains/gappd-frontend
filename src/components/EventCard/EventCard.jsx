import React, { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import Avatar from '../Avatar/Avatar'
import FollowButton from '../FollowButton/FollowButton'
import './EventCard.css'

const EventCard = ({ event, onEdit, onDelete, onShare, showActions = true, withinLink = false}) => {
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
      username: event?.username,
      avatar_url: event?.avatar_url,
      avatar_photo_id: event?.avatar_photo_id,
      updatedAt: event?.user_updated_at
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
    if (event?.cover_photo_url) {
      return event.cover_photo_url
    } 
    if (event?.cover_photo_id) {
      return `${API_URL}/photos/${event.cover_photo_id}`
    } 
    return ""
  }, [API_URL, event?.cover_photo_url, event?.cover_photo_id])

  // const coverSrc = useMemo(() => {
  //   if (event?.cover_photo_url && /^https?:\/\//i.test(event.cover_photo_url)) {
  //     return event.cover_photo_url;
  //   }
  //   if (event?.cover_photo_id) {
  //     return `${API_URL}/photos/${event.cover_photo_id}`;
  //   }
  //   return ""
  // }, [API_URL, event?.cover_photo_url, event.cover_photo_id])

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

  const HostLink = ({ to, children, ...rest }) =>
    withinLink ? <span {...rest}>{children}</span> : <Link to={to} {...rest}>{children}</Link>

  const handleOpen = useCallback(() => {
    if (!withinLink && event?.id) {
      navigate(`/events/${event.id}`)
    }
  }, [navigate, event?.id, withinLink])

  const handleShare = useCallback(() => {
    if (onShare) {
      return onShare(event)
    }
    const url = `${window.location.origin}/events/${event.id}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    alert("Event link copied.");
  }, [onShare, event])

  const handleEdit = useCallback(() => {
    if (onEdit) {
      return onEdit(event)
    } 
    navigate(`/events/${event.id}`);
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
      const response = await fetch(`${API_URL}/events/${event.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token || ""}` },
      })
      if (!response.ok) {
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
        <div className="eventcard-header">
          <HostLink to={`/profile/${host?.username ?? "unknown"}`} className="eventcard-host-top">
            <Avatar userId={host?.id} username={host?.username ?? "user"} avatar_url={host?.avatar_url} avatar_photo_id={host?.avatar_photo_id} updatedAt={host?.updatedAt || host?.updated_at} size={40}/>
            <div>
              <div className="eventcard-host-name">{host?.username ?? "unknown"}</div>
              {isOwner && <span className="eventcard-organizer">Organizer</span>}
            </div>
          </HostLink>
          {!isOwner && host?.id && <FollowButton targetUserId={host.id} />}
          {isOwner && (
            <div className="eventcard-owner-actions">
              <button type="button" onClick={handleEdit} title="Edit event">✎</button>
              <button type="button" onClick={handleDelete} title="Delete event">✕</button>
            </div>
          )}
        </div>

        {coverSrc && (
          <section className="eventcard-image-wrap" onClick={handleOpen} style={{ cursor: "pointer" }}>
            <img
              alt={event?.title ? `${event.title} cover` : "event cover"}
              src={coverSrc}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          </section>
        )}
        
        <div className="eventcard-content">
          {/* Title */}
          {event?.title && (
            <div className="eventcard-field">
              <span className="eventcard-label">Event: </span>
              <h3 className="eventcard-title">{event.title}</h3>
            </div>
          )}
          
          {startText && (
            <div className="eventcard-field">
              <span className="eventcard-label">When: </span>
              <div className="eventcard-date">{startText}</div>
            </div>
          )}

          {(event?.location || event?.city) && (
            <div className="eventcard-field">
              <span className="eventcard-label">Location: </span>
              <div className="eventcard-location">
                {event.location ||
                  [event.city, event.state, event.country].filter(Boolean).join(", ")}
              </div>
            </div>
          )}

          {event?.description && (
            <div className="eventcard-field">
              <span className="eventcard-label">Description: </span>
              <p className="eventcard-description">{event.description}</p>
            </div>
          )}

          {showActions && (
            <button className="eventcard-share-btn" type="button" onClick={handleShare}>Share Event</button>
          )}
        </div>
      </article>
    </>
  )
}

export default EventCard