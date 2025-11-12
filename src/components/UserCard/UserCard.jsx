import React from 'react'
import './UserCard.css'
import FollowButton from '../FollowButton/FollowButton'

export default function UserCard({ user }) {
  return (
    <div className="usercard">
      <img className="usercard-avatar" src={user.avatar || '/assets/default-avatar.png'} alt={`${user.name} avatar`} />
      <div className="usercard-body">
        <div className="usercard-top">
          <div>
            <div className="usercard-name">{user.name}</div>
            <div className="usercard-username">@{user.username}</div>
          </div>
          <div className="usercard-action">
            <FollowButton userId={user.id} />
          </div>
        </div>
        {user.bio && <div className="usercard-bio">{user.bio}</div>}
      </div>
    </div>
  )
}
