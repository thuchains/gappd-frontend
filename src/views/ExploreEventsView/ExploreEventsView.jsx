import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useId } from 'react'
import { useAuth } from '../../context/AuthContext'
import EventCard from '../../components/EventCard/EventCard'
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
             const data = await response.json().catch(() => (Array.isArray(data) ? data: []))
            if (!response.ok) {
                throw new Error(`Events feed failed ( ${response.status})`)
            }
            if (!response.ok) {
                throw new Error(data?.message || `Failed to load events (${response.status})`)
            }
            const list = Array.isArray(data) ? data : (data?.items || [])
            setEvents(Array.isArray(list) ? list : [])
        } catch (e) {
            if (e.name !== "AbortError")
                setEvents([])
                setError(e.message || "Failed to load events")
        } 
    }, [])

    useEffect(() => {
        fetchEventsFeed(allEventsUrl)
    }, [allEventsUrl, location.state?.refresh])

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
        <div> 
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
                {error ? (<div>{error}</div>) 
                : 
                    events.length === 0 ? (<div>No events found for that date</div>) 
                : 
                    (<div>{events.map((event) => (
                    <Link key={String(event.id)} to={`/events/${event.id}`}><EventCard event={event}/></Link>
                    ))}
                    </div>
                )}
        </div>
    </>
  )
}

export default ExploreEventsView