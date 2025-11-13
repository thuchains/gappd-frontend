import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useId } from 'react'
import { useAuth } from '../../context/AuthContext'
import EventCard from '../../components/EventCard/EventCard'
import './ExploreEventsView.css'
import { Link, useLocation } from 'react-router-dom'

const ExploreEventsView = () => {
    const { API_URL } = useAuth()
    const location = useLocation()
    const [date, setDate] = useState("")
    const [events, setEvents] = useState([])
    const [error, setError] = useState("")
    
    const dateId = useId()

    const allEventsUrl = useMemo(() => `${API_URL}/events`, [API_URL])

    const filterByDay = useCallback((yyyyMmDd) => {
        const start = new Date(`${yyyyMmDd}T00:00:00`)
        const end = new Date(start)
        end.setDate(start.getDate() + 1)
        const fromIso = start.toISOString()
        const toIso = end.toISOString()
        return `${API_URL}/events/search?from=${encodeURIComponent(fromIso)}&to=${encodeURIComponent(toIso)}`
  }, [API_URL])

    const fetchEventsFeed = useCallback(async (url) => {
        setError("")
        try {
            const response = await fetch (url)
            const payload = await response.json().catch(() => ({}))
            if (!response.ok) {
                const msg =
                    payload?.message ||payload?.error || (payload?.errors ? JSON.stringify(payload.errors) : `Request failed (${response.status})`)
                    throw new Error(msg)
            }
            const list = Array.isArray(payload) ? payload : (payload?.items || [])
            setEvents(Array.isArray(list) ? list : [])
        } catch (e) {
            console.error("Failed to fetch events")
            setEvents([])
            setError(e?.message || "Failed to laod events")
        } 
    }, [])

    useEffect(() => {
    fetchEventsFeed(allEventsUrl)
    }, [allEventsUrl, location.state?.refresh, fetchEventsFeed])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!date) {
            fetchEventsFeed(allEventsUrl)
            return
        }
        fetchEventsFeed(filterByDay(date))
    }

    const onClear = () => {
        setDate("")
        setError("")
        fetchEventsFeed(allEventsUrl)
    }


  return (
    <>
        <div className="explore-root"> 
            <div className="explore-search-card">
                <div>
                    <h1>Explore Events</h1>
                    <p>Enter a date to search</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className='filters'>
                        <label htmlFor={dateId}>Date</label>
                        <input id={dateId} type="date" name="date" className='date' value={date} onChange={(e) => setDate(e.target.value)}/>
                        <div>
                            <button className='submit-btn' type='submit'>Search</button>
                            <button className='clear-btn' type='button' onClick={onClear}>Clear</button>
                        </div>
                    </div>
                </form>
            </div>
            {!error && (events.length === 0 ? (<div>No events found for that date</div>
            ) 
            : 
            (
                <div className="explore-events-grid">
                    {events.map((event) => (
                        <EventCard key={event.id ?? `${event.title || "event"}-${event.start_time || ""} `} event={event}/>
                    ))}
                </div>
            ))}
        </div>
    </>
  )
}

export default ExploreEventsView