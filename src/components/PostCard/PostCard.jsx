import React, { useMemo, useState, useContext, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import FollowButton from "../FollowButton/FollowButton";
import LikeButton from "../LikeButton/LikeButton";
import CommentList from "../CommentList/CommentList";
import Avatar from "../Avatar/Avatar";
import { useAuth } from "../../context/AuthContext";
import './PostCard.css'

const formatCount = (n) => {
  if (typeof n !== "number" || n <= 0) {
    return ""
  }
  return `(${n})`
}

const PostCard = ({ post, onDelete, onEdit, onShare, showActions=true, compact=false }) => {
  const navigate = useNavigate()
  const { user, API_URL } = useAuth()
  // const author = useMemo(() => {
  //   if (post.author) {
  //     return post.author
  //   }
  //   if (post.user) {
  //     return post.user
  //   }
  //   return {
  //     id: post.user_id,
  //     username: post.username,
  //     avatar_photo_id: post.avatar_photo_id
  //   }
  // }, [post])
  const author = useMemo(() => {
    if (post?.author) return post.author;
    if (post?.user) return post.user;
    return {
      id: post?.user_id,
      username: post?.username,
      avatar_url: post?.avatar_url,
      avatar_photo_id: post?.avatar_photo_id,
      avatar_updated_at: post?.avatar_updated_at,
    };
  }, [post]);

  // DEBUG: log what the card actually received and what it derived for the author
  useEffect(() => {
    console.log("[PostCard] raw post:", post);
    console.log("[PostCard] derived author:", author);
  }, [post, author]);

  // const avatarSrc = useMemo(() => {
  //     const pid =
  //       author?.avatar_photo_id ??
  //       author?.avatarId ??
  //       author?.avatar_id ??
  //       post?.avatar_photo_id;

  //     if (pid) {
  //       return `${API_URL}/photos/${pid}`;
  //     } 
  //     if (author?.avatar_url?.startsWith("http")) {
  //       return author.avatar_url;
  //     }

  //     return "/images/avatar-placeholder.png";
  //   }, [API_URL, author, post])
  
  const isOwner = useMemo(() => {
    if (!user) {
      return false
    }
    const ownerId = author?.id ?? post.user_id
    return String(ownerId ?? "") === String(user.id ?? "")
  }, [author?.id, post.user_id, user])

  const createdAtText = useMemo(() => {
    if (!post?.created_at) {
      return ""
    }
    try {
      const date = new Date(post.created_at)
      return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
      })
    } catch {
      return String(post.created_at)
    }
  }, [post?.created_at])

  const photoUrls = useMemo(() => {
    if (!Array.isArray(post?.photos)) return [];
    return post.photos
      .map((p) => {
        // accept various shapes: {id}, {photo_id}, number, or already-absolute url
        if (typeof p === "number") return `${API_URL}/photos/${p}`;
        const id = p?.photo_id ?? p?.id;
        if (id) return `${API_URL}/photos/${id}`;
        const maybeUrl = p?.url || p?.photo_url || p?.path;
        if (typeof maybeUrl === "string" && /^https?:\/\//i.test(maybeUrl)) {
          return maybeUrl; // already a full URL
        }
        return null;
      })
      .filter(Boolean);
  }, [API_URL, post?.photos])

  const [showComments, setShowComments] = useState(false)
  const toggleComments = useCallback(() => setShowComments((v) => !v), [])
  const handleOpen = useCallback(() => navigate(`/posts/${post.id}`), [navigate, post?.id])

  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(post)
    }
    else navigate(`/posts/${post.id}/edit`)
  }, [onEdit, navigate, post])

  const handleDelete = useCallback(async () => {
    const ok = window.confirm("Delete post?")
    if (!ok) {
      return
    }
    if (onDelete) {
      onDelete(post.id)
    }
  }, [onDelete, post?.id])

  const handleShare = useCallback(() => {
    if (onShare) {
      return onShare(post)
    }
    const url = `${window.location.origin}/posts/${post.id}`
    navigator.clipboard?.writeText(url).catch(() => {})
    alert("Post link copied")
  }, [onShare, post])

  
  return (
    <>
      <article className="postcard" data-post-id={post.id}>
        <header className="postcard-header">
          <div className="postcard-left">
            <Link to={`/profile/${author?.username ?? "unknown"}`} aria-label="View profile" className="postcard-user">
              <Avatar userId={author?.id} username={author?.username ?? "user"} size={compact ? 36 : 56} updatedAt={author?.avatar_updated_at || post?.updated_at} />
            </Link>
            <div className="postcard-userinfo">
              <div className="postcard-userline">
                <Link to={`/profile/${author?.username ?? "unknown"}`} className="postcard-username">
                  {author?.username ?? "unknown"}
                </Link>
                {!isOwner && author?.id && (
                  <span><FollowButton targetUserId={author.id}/></span>
                )}
              </div>
              {createdAtText && <div className="postcard-location">{createdAtText}</div>}
            </div>
          </div>
          {isOwner && (
            <div className="postcard-header-actions">
              <button type="button" onClick={handleEdit} aria-label="Edit post" className="linklike">Edit</button>
              <button type="button" onClick={handleDelete} aria-label="Delete post" className="linklike">Delete</button>
            </div>
          )}
        </header>

        {photoUrls.length > 0 && (
          <section className="postcard-media-wrap" onClick={handleOpen}>
            {photoUrls.map((src, idx) => (
              <div key={src || idx} className="postcard-media">
                <img src={src} alt="post media" />
              </div>
            ))}
          </section>
        )}

        {post?.caption && (
          <section className="postcard-caption">
            <Link to={`/profile/${author?.username ?? "unknown"}`} className="postcard-caption-user">{author?.username ?? "unknown"}</Link>
            <p>{post.caption}</p>
          </section>
        )}

        {showActions && (
          <section className="postcard-actions">
            <LikeButton postId={post.id} initialCount={post.like_count} />
            <button className="view-comments" onClick={toggleComments} type="button">
              {showComments ? "Hide comments" : `View comments ${formatCount(post.comment_count)}`}
            </button>
            <button type="button" onClick={handleShare}>Share</button>
          </section>
        )}

        {showComments && (
          <section>
            <CommentList postId={post.id} />
          </section>
        )}
      </article>
    </>
  )
}

export default PostCard