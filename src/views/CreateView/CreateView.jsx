import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useMemo, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import './CreateView.css'


const Tab = {
  POST: "post",
  EVENT: "event"
}

const initialPost = { 
  caption: "", 
  images: [],
  location: ""
}

const initialEvent = { 
  title: "", 
  description: "",
  start_time: "", 
  street_address: "",
  city: "",
  state: "",
  zipcode: "",
  country: "",
  cover: null
}

const toFileArray = (f) => Array.isArray(f) ? f : f ? Array.from(f) : []

const CreateView = () => {
  const navigate = useNavigate()
  const { token, API_URL } = useAuth()

  const [active, setActive] = useState(Tab.POST)
  const [post, setPost] = useState(initialPost)
  const [eventFields, setEventFields] = useState(initialEvent)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const isEvent = active === Tab.EVENT

  const headers = token ? { Authorization: `Bearer ${token}`} : {}

  const validate = () => {
    if (isEvent) {
      if (!eventFields.title.trim()) {
        return "Event title is required."
      }
      if (!eventFields.description.trim()) {
        return "Event description is required."
      }
      if (!eventFields.start_time) {
        return "Event date is required."
      }
      if (!eventFields.city) {
        return "Event city is required."
      }
      if (!eventFields.state) {
        return "Event state is required."
      }
      if (!eventFields.zipcode) {
        return "Event zipcode is required."
      }
      if (!eventFields.country) {
        return "Event country is required."
      }
    } else {
      if (!post.caption.trim() && toFileArray(post.images).length === 0) {
        return "Add a caption or an image."
      }
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) {
      return
    }
    setError("")
    setSuccess("")
    const v = validate()
    if (v) {
      setError(v)
      return
    }

    setSubmitting(true)
    try {
      let response
      if (isEvent) {
        if (eventFields.cover) {
          const formData = new FormData()
          formData.append("title", eventFields.title.trim())
          formData.append("description", eventFields.description.trim())
          formData.append("start_time", eventFields.start_time.trim())
          if (eventFields.street_address){
            formData.append("street_address", eventFields.street_address)
          }
          formData.append("city", eventFields.city.trim())
          formData.append("state", eventFields.state.trim())
          formData.append("zipcode", eventFields.zipcode.trim())
          formData.append("country", eventFields.country.trim())
          formData.append("cover_photo", eventFields.cover)
          response = await fetch(`${API_URL}/events`, {
            method: "POST",
            headers,
            body: formData,
          })
        } else {
          const body = {
            title: eventFields.title.trim(), 
            description: eventFields.description.trim(),
            start_time: eventFields.start_time, 
            street_address: eventFields.street_address || undefined,
            city: eventFields.city.trim(),
            state: eventFields.state.trim(),
            zipcode: eventFields.zipcode.trim(),
            country: eventFields.country.trim()
          }
          response = await fetch(`${API_URL}/events`, {
            method: "POST",
            headers: {"Content-Type": "application/json", ...headers},
            body: JSON.stringify(body),
          })
        }
      } else {
        const formData = new FormData()
        if (post.caption) {
          formData.append("caption", post.caption)
        }
        if (post.location) {
          formData.append("location", post.location)
        }
        const files = toFileArray(post.images)
        files.forEach((f) => formData.append("files", f))

        response = await fetch(`${API_URL}/posts`, {
          method: "POST",
          headers,
          body: formData,
      })
    }

    if (!response.ok) {
      let msg = `Request failed with ${response.status}`
      try {
        const data = await response.json()
        if (data?.errors) {
          msg = JSON.stringify(data.errors)
        } else if (data?.message) {
          msg = data.message
        } else if (data?.error) {
          msg = data.error
        } else if (typeof data === "string") {
          msg = data
        } else if (typeof data === "object") {
          msg = JSON.stringify(data)
        }
      } catch {
        throw new Error(msg)
      }
    }
    await response.json().catch(() => ({}))
    setSuccess(isEvent ? "Event posted!" : "Post Created!")
    setPost(initialPost)
    setEventFields(initialEvent)
    navigate(isEvent ? "/explore/events" : "/home", {
      replace: true,
      state: { refresh: Date.now()}
    })
  } catch (error) {
    setError(error.message || "Something went wrong creating your post.")
  } finally {
    setSubmitting(false)
  }
  }

  const onChangePost = (e) => {const { name, value } = e.target; 
    setPost((p) => ({...p, [name]: value}))
  }
  
  const onChangeEvent = (e) => {const { name, value } = e.target; 
    setEventFields((p) => ({...p, [name]: value}))
  }

  const postFileInputRef = useRef(null)
  
  const coverInputRef = useRef(null)

  const pickPostImages = (e) => {const newFiles = Array.from(e.target.files || []);
    if (!newFiles.length) {
      return
    } 
    setPost((p) => ({...p, images: [...toFileArray(p.images), ...newFiles]}))
  }

  const removePostImageAt = (idx) => {
    setPost((p) => {
      const array = toFileArray(p.images)
      return {...p, images: array.filter((_, i) => i !== idx)}
    })
  }

  const pickCover = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setEventFields((p) => ({...p, cover: file}))
    }
  }
  const removeCover = () => setEventFields((p) => ({...p, cover:null}))

  // const onDrop = (e) => {
  //   e.preventDefault()
  //   const droppedFiles = Array.from(e.dataTransfer.files || [])
  //   if (!droppedFiles.length) {
  //     return
  //   }
  //   if (isEvent) {
  //     setEventFields((p) => ({...p, cover: droppedFiles[0]}))
  //   } else {
  //     setPost((p) => ({...p, images: [...toFileArray(p.images), ...droppedFiles]}))
  //   }
  // }



  const postFiles = toFileArray(post.images)
  const postPreview = useMemo(() => 
    postFiles.map((f) => URL.createObjectURL(f)
  ), [postFiles])

  const coverPreview = useMemo(() => (
    eventFields.cover ? URL.createObjectURL(eventFields.cover) : ""
  ), [eventFields.cover])


  return (
    <>
      <div className="create-view-container">
        <div className="create-view-form">
          <div className="create-tabs">
            <button type='button' className={!isEvent ? "active" : ""} onClick={() => setActive(Tab.POST)} aria-pressed={!isEvent}>Create Post</button>
            <button type='button' className={isEvent ? "active" : ""} onClick={() => setActive(Tab.EVENT)} aria-pressed={isEvent}>Create Event</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="upload-area" role='button' tabIndex={0} onKeyDown={(e) => e.key === "Enter" && (isEvent ? coverInputRef.current?.click() : postFileInputRef.current?.click())} aria-label={isEvent ? "Upload cover image" : "Add images"}>
              {isEvent ? (
                <>
                  {coverPreview ? (
                    <div className="cover-preview">
                      <img src={coverPreview} alt="cover preview"/>
                      <div className="cover-actions">
                        <button type='button' onClick={() => coverInputRef.current?.click()}>Change</button>
                        <button type='button' onClick={removeCover}>Remove</button>
                      </div>
                    </div>
                  )
                  : 
                  (
                    <>
                      <p>Click to upload a cover image</p>
                      <button type='button' onClick={() => coverInputRef.current?.click()}>Upload Cover</button>
                    </>
                  )}
                </>
              ) 
              :
              (
                <>
                  {postPreview.length > 0 && (
                    <div className="image-preview-grid">
                      {postPreview.map((src, idx) => (
                        <div key={idx} className="image-preview-item">
                          <img src={src} alt="" />
                          <button type='button' className="remove-btn" onClick={() => removePostImageAt(idx)}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p>Click to add images</p>
                  <button type='button' onClick={() => postFileInputRef.current?.click()}>Add Images</button>
                </>
              )}
              <input type="file" ref={postFileInputRef} accept='image/*' multiple hidden onChange={pickPostImages} />
              <input type="file" ref={coverInputRef} accept='image/*' hidden onChange={pickCover} />
            </div>
            {!isEvent && (
              <div>
                <div className="form-group">
                  <label htmlFor="caption">Caption</label>
                  <textarea name="caption" id="caption" value={post.caption} onChange={onChangePost} placeholder='Write a caption...' rows={3}/>
                </div>
                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input type="text" name="location" id="location" value={post.location} onChange={onChangePost} placeholder="Add a location" />
                </div>
              </div>
            )}
          
            {isEvent && (
              <div>
                <div className='form-group'>
                  <label htmlFor="title">Title</label>
                  <input type="text" name='title' value={eventFields.title} onChange={onChangeEvent} placeholder='Enter event title' required />
                </div>
                <div className='form-group'>
                  <label htmlFor="description">Description</label>
                  <textarea name="description" id="description" value={eventFields.description} onChange={onChangeEvent} rows={4} placeholder='Write a description of your event' required/>
                </div>
                <div className='form-group'>
                  <label htmlFor="start_time">Event Date</label>
                  <input type="date" name="start_time" id="start_time" value={eventFields.start_time} onChange={onChangeEvent} required />
                </div>
                <div className="form-group">
                  <label htmlFor="street_address">Street Address</label>
                  <input type="text" name="street_address" id="street_address" value={eventFields.street_address} onChange={onChangeEvent} placeholder="Street address (optional)" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input type="text" name='city' value={eventFields.city} onChange={onChangeEvent} placeholder="City" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="state">State</label>
                    <input type="text" name="state" id="state" value={eventFields.state} onChange={onChangeEvent} placeholder="State" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="zipcode">Zip Code</label>
                    <input type="text" name="zipcode" id="zipcode" value={eventFields.zipcode} onChange={onChangeEvent} placeholder="Zip code" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <input type="text" name="country" id="country" value={eventFields.country} onChange={onChangeEvent} placeholder="Country" required />
                  </div>
                </div>  
              </div>
            )}
            {error && (<div className="message-box error">{error}</div>)}
            {success && (<div className="message-box success">{success}</div>)}
            <div>
              <button type='submit' disabled={submitting} className="submit-btn">{submitting ? "Submitting..." : isEvent ? "Post Event" : "Post"}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default CreateView