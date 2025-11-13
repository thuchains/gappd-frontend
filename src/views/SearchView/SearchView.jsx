import React, { useState } from 'react'
import './SearchView.css'
import SearchBar from '../../components/SearchBar/SearchBar'
import UserCard from '../../components/UserCard/UserCard'
import { useAuth } from '../../context/AuthContext'
import { useCallback } from 'react'

export default function SearchView() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { API_URL, token } = useAuth()

//   async function handleSearch(query) {
//     const trimmed = (query || '').trim()
//     if (!trimmed) {
//       setResults([])
//       setError(null)
//       return
//     }

//     setLoading(true)
//     setError(null)

//     try {
//       const url = `${API_URL}/users/search?username=${encodeURIComponent(trimmed)}`
//       const response = await fetch(url, {
//         headers: {
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//       })

//       if (!response.ok) {
//         if (response.status === 404) {
//           setResults([])
//           setError(null)
//           return
//         }
//         throw new Error(`Search failed with status ${response.status}`)
//       }

//       const data = await response.json()
//       // backend returns { users: [...] }
//       setResults(data.users || [])
//       setError(null)
//     } catch (e) {
//       console.warn('search error', e)
//       setError('Something went wrong while searching.')
//       setResults([])
//     } finally {
//       setLoading(false)
//     }
//   }

    const handleSearch = useCallback(
    async (query) => {
      const trimmed = (query || '').trim()
      if (!trimmed) {
        setResults([])
        setError(null)
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const url = `${API_URL}/users/search?username=${encodeURIComponent(
          trimmed,
        )}`
        const res = await fetch(url, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })
        if (!res.ok) {
          if (res.status === 400) {
            setResults([])
            setError('Please enter a username to search.')
            return
          }
          throw new Error(`Search failed with status ${res.status}`)
        }
        const data = await res.json()
        setResults(data.users || [])
      } catch (e) {
        console.warn('search error', e)
        setError('Something went wrong while searching.')
        setResults([])
      } finally {
        setLoading(false)
      }
    }, [API_URL, token])

  return (
    <div className="search-view">
      <h2 className="search-title">Search users</h2>
      <SearchBar onSearch={handleSearch} placeholder="Search people or usernames" />

      {loading && <div className="search-loading">Searching…</div>}
      {error && <div className="search-error">{String(error)}</div>}

      <div className="search-results">
        {results.length === 0 && !loading ? (
          <div className="no-results">No results</div>
        ) 
        : 
        (
          results.map(user => <UserCard key={user.id} user={user} />)
        )}
      </div>
    </div>
  )
}
