import React, { useState } from 'react'
import './SearchView.css'
import SearchBar from '../../components/SearchBar/SearchBar'
import UserCard from '../../components/UserCard/UserCard'

export default function SearchView() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSearch(query) {
    if (!query || query.trim() === '') {
      setResults([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Replace this endpoint with your real backend search endpoint
      const res = await fetch(`/api/search/users?q=${encodeURIComponent(query)}`)
      if (!res.ok) throw new Error('network')
      const data = await res.json()
      setResults(data.users || [])
    } catch (e) {
      console.warn('search error', e)
      // If there's no real backend during development, provide a small
      // client-side fallback so the UI is usable.
      const sample = [
        { id: 1, name: 'Ava Stone', username: 'ava', avatar: '/assets/default-avatar.png', bio: 'Hiking & coffee' },
        { id: 2, name: 'Liam Hart', username: 'liam', avatar: '/assets/default-avatar.png', bio: 'Photography' },
        { id: 3, name: 'Maya Chen', username: 'maya', avatar: '/assets/default-avatar.png', bio: 'Frontend dev' },
      ]
      const filtered = sample.filter(u =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.username.toLowerCase().includes(query.toLowerCase())
      )
      setResults(filtered)
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="search-view">
      <h2 className="search-title">Search users</h2>
      <SearchBar onSearch={handleSearch} placeholder="Search people or usernames" />

      {loading && <div className="search-loading">Searching…</div>}
      {error && <div className="search-error">{String(error)}</div>}

      <div className="search-results">
        {results.length === 0 && !loading ? (
          <div className="no-results">No results</div>
        ) : (
          results.map(user => <UserCard key={user.id} user={user} />)
        )}
      </div>
    </div>
  )
}
