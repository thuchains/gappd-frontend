import React, { useState, useEffect, useRef } from 'react'
import './SearchBar.css'

export default function SearchBar({ onSearch, placeholder = 'Search…' }) {
  const [query, setQuery] = useState('')
  const debounceRef = useRef(null)
  const onSearchRef = useRef(onSearch)

  useEffect(() => {
    onSearchRef.current = onSearch
  }, [onSearch])

  useEffect(() => {
    if (!onSearchRef.current) {
        return
    }
    if (debounceRef.current) {
        clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      onSearchRef.current(query)
    }, 350)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, onSearchRef])

  return (
    <div className="searchbar">
      <input className="searchbar-input" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={placeholder} aria-label="Search users"/>
      <button className="searchbar-clear" onClick={() => setQuery('')} aria-label="Clear" title="Clear">x</button>
    </div>
  )
}
