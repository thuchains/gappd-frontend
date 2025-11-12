import React, { useEffect, useState } from 'react'
import './ThemeToggle.css'

const THEME_KEY = 'gappd_theme'

const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) || 'dark'
    } catch {
      return 'dark'
    }
  })

  useEffect(() => {
    const el = document.documentElement
    if (theme === 'light') {
      el.classList.add('light-theme')
    } else {
      el.classList.remove('light-theme')
    }
    try { localStorage.setItem(THEME_KEY, theme) } catch { void 0 }
  }, [theme])

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return (
    <div className={`theme-toggle ${theme === 'light' ? 'light' : 'dark'}`}>
      <label className="switch">
        <input
          type="checkbox"
          checked={theme === 'light'}
          onChange={toggle}
          aria-label="Toggle light theme"
        />
        <span className="slider" />
      </label>
    </div>
  )
}

export default ThemeToggle
