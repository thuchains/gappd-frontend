import React, { useEffect, useState } from 'react'
import { useId } from 'react'
import { useAuth } from '../../context/AuthContext'
import EventCard from '../../components/EventCard/EventCard'
import { Link } from 'react-router-dom'

const ExploreEventsView = () => {
    const { API_URL } = useAuth()
    const [date, setDate] = useState("")
    const [events, setEvents] = useState([])
    const [error, setError] = useState("")
    const dateId = useId()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        
        try {
            let url = `${API_URL}/events`
            if (date) url += `?date=${encodeURIComponent(date)}` //got chatgpt help here to change url
            const response = await fetch(url)
            const data = await response.json().catch(() => [])
            if (!response.ok) {
                throw new Error(data?.message || "Failed to load events")
            }
            setEvents(Array.isArray(data) ? data : (data?.items || []))
        } catch (e) {
            setEvents([])
            setError(e.message)
        } 
    }

    const onClear = () => {
        setDate("")
        setEvents([])
        setError("")
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