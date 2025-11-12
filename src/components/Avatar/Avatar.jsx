import React, { useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import './Avatar.css'

const Avatar = ({ userId, username, avatar_url, avatar_photo_id, size = 44, updatedAt, fallback = "/images/avatar-placeholder.png" }) => {
    const { API_URL } = useAuth()
    const [src, setSrc] = useState()

    const url = useMemo(() => {
        if (avatar_url && /^https?:\/\//i.test(avatar_url)) return avatar_url
        if (avatar_photo_id) {
            return `${API_URL}/photos/${avatar_photo_id}`
        }
        if (userId != null) {
            const bust = updatedAt ? `?t=${encodeURIComponent(updatedAt)}` : ""
            return `${API_URL}/users/${userId}/avatar${bust}`
        }
        return fallback
    }, [API_URL, userId, updatedAt, fallback, avatar_photo_id, avatar_url])

    const handleError = () => setSrc(fallback)

    return (
        <span className="avatar-wrap" style={{ width: size, height: size }} aria-hidden>
            <img
                className="avatar-img"
                src={src || url}
                alt={`${username} avatar`}
                width={size}
                height={size}
                onError={handleError}
            />
        </span>
    )
}

export default Avatar