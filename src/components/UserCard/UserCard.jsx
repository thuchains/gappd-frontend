import React from 'react'
import './UserCard.css'
import Avatar from '../Avatar/Avatar'
import FollowButton from '../FollowButton/FollowButton'
import { Link } from 'react-router-dom'

export default function UserCard({ user, showFollow = true }) {
    const displayName = (user.first_name || user.last_name) ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : user.username

  return (
    <div className="usercard">
      <Link to={`/profile/${user.username}`} className='usercard-avatar'>
        <Avatar userId={user.id} profilePhotoId={user.profile_photo_id}/>
      </Link>  
      <div className="usercard-body">
        <div className="usercard-top">
          <div>
            <Link to={`/profile/${user.username}`} className='usercard-name'>
            {displayName}
            </Link>
            <div className="usercard-username">@{user.username}</div>
          </div>
          {showFollow && (
            <div className="usercard-action">
                <FollowButton targetUserId={user.id} initialFollowing={user.is_following ?? false}/>
            </div>
            )}
        </div>
        {user.bio && <div className="usercard-bio">{user.bio}</div>}
      </div>
    </div>
  )
}
