import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const EventDetailView = () => {
    const { id } = useParams()
    const { API_URL, token } = useAuth()
    const [eventData, setEventData] = useState()
    const [error, setError] = useState("")

    useEffect(() => {
        (async () => {
            setError("")
            try {
                const response = await fetch(`${API_URL}/events/${encodeURIComponent(id)}`, {
                    headers: token ? { Authorization: `Bearer ${token}`} : {}
                })
                const data = await response.json().catch(() => null)
                if (!response.ok) {
                    throw new Error(data?.message || "Failed to load event")
                }
                setEventData(data)
            } catch (e) {
                setEventData(null)
                setError(e.message)
            }
        }

        )()
    }, [API_URL, token, id])

    if (error) {
        return <div>{error}</div>
    }
    if (!eventData) {
        return <div>No event found</div>
    }


  return (
    <>
    <Link to="/explore/events">Back to Explore</Link>
    {eventData.cover_url && (
        <img src={eventData.cover_url}/>
    )}
    <h1>{eventData.title}</h1>
    <div>
        {eventData.data ? new Date(eventData.date).toLocaleDateString() : "Date TBD"}
        {eventData.location ? ` ${eventData.location}` : ""}
    </div>
    {eventData.description && <p>{eventData.description}</p>}
    {eventData.organizer?.username && (
        <div>Hosted by @{eventData.organizer.username}</div>
    )}
    </>
  )
}

export default EventDetailView