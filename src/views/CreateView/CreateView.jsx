import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useMemo, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'


const Tab = {
  POST: "post",
  EVENT: "event"
}

const initialPost = { 
  caption: "", 
  image: null 
}

const initialEvent = { 
  title: "", 
  description: "",
  start_time: "", 
  street_address: "",
  city: "",
  state: "",
  zipcode: "",
  country: ""
}

const CreateView = () => {
  const navigate = useNavigate()
  const { token, API_URL } = useAuth()
  const fileInputRef = useRef(null)

  const [active, setActive] = useState(Tab.POST)
  const [post, setPost] = useState(initialPost)
  const [eventFields, setEventFields] = useState(initialEvent)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const isEvent = active === Tab.EVENT

  const validate = () => {
    if (isEvent) {
      if (!eventFields.title?.trim()) {
        return "Event title is required."
      }
      if (!eventFields.description?.trim()) {
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
      if (!post.caption.trim() && !post.image) {
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
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setSubmitting(true)
    try {
      let response
      if (isEvent) {
        if (post.image) {
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
          formData.append("cover_photo", post.image)
          response = await fetch(`${API_URL}/events`, {
            method: "POST",
            headers: {...(token ? { Authorization: `Bearer ${token}`} : {})},
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
            headers: {"Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}`} : {})},
            body: JSON.stringify(body),
          })
        }
      } else {
        const formData = new FormData()
        if (post.caption) {
          formData.append("caption", post.caption)
        }
        if (post.image) {
          formData.append("caption", post.image)
        }
        response = await fetch(`${API_URL}/posts`, {
          method: "POST",
          headers: {...(token ? { Authorization: `Bearer ${token}` }: {})},
          body: formData,
      })
    }

    if (!response.ok) {
      let msg = `Request failed with ${response.status}`
      try {
        const data = await response.json()
        if (typeof data === "string") {
          msg = data
        } else if (data?.message) {
          msg = data.message
        } else if (data?.error) {
          msg = data.error
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
    fileInputRef.current && (fileInputRef.current.value = "")
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

  const onChangePost = (e) => setPost((p) => ({...p, [e.target.name]: e.target.value}))

  const onChangeEvent = (e) => setEventFields((p) => ({...p, [e.target.name]: e.target.value}))

  const onPickFile = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setPost((p) => ({...p, image: file}))
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setPost((p) => ({...p, image: file}))
    }
  }

  const removeImage = () => {
    setPost((p) => ({...p, image: null}))
    fileInputRef.current && (fileInputRef.current.value = "")
  }

  const previewUrl = useMemo(() => (
    post.image ? URL.createObjectURL(post.image) : ""
  ), [post.image])


  return (
    <>
      <div>
        <div>
          <button type='button' className={`${!isEvent ? "bg-black text-white": "bg-white text-black"}`} onClick={() => setActive(Tab.POST)} aria-pressed={!isEvent}>Create Post</button>
          <button type='button' className={`${isEvent ? "bg-black text-white" : "bg-white text-black"}`} onClick={() => setActive(Tab.EVENT)} aria-pressed={isEvent}>Create Event Post</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div onDragOver={(e) => e.preventDefault()} onDrop={onDrop} role='button' tabIndex={0} onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()} aria-label='Upload Image'>
            {post.image ? 
            (
              <div>
                <img src={previewUrl}/>
                <div>
                  <button type='button' onClick={() => fileInputRef.current?.click()}>Change Image</button>
                  <button type='button' onClick={removeImage}>Remove</button>
                </div>
              </div>
            )
            :
            (
              <>
                <p>Drag and drop and image here, or click to upload</p>
                <button type='button' onClick={() => fileInputRef.current?.click()}>Choose Image</button>
              </>
            )}
            <input type="file" ref={fileInputRef} accept='image/*' className='hidden' onChange={onPickFile} />
          </div>
          {!isEvent && (
            <div>
              <label htmlFor="caption">Caption</label>
              <textarea name='caption' value={post.caption} onChange={onChangePost} placeholder='Write a caption...' rows={3}/>
            </div>
          )}
          {isEvent && (
            <div>
              <div className='title-container'>
                <label htmlFor="title">Title</label>
                <input type="text" value={eventFields.title} onChange={onChangeEvent} placeholder='Enter event title' required />
              </div>
              <div className='description-container'>
                <label htmlFor="description">Description</label>
                <textarea name="description" id="description" value={eventFields.description} onChange={onChangeEvent} rows={4} placeholder='Write a description of your event' required/>
              </div>
              <div className='data-container'>
                <label htmlFor="start_time">Event Date</label>
                <input type="date" name="start_time" id="start_time" value={eventFields.start_time} onChange={onChangeEvent} required />
              </div>
              <div className="address">
                <label htmlFor="street_address">Street Address</label>
                <input type="text" name="street_address" id="street_address" value={eventFields.street_address} onChange={onChangeEvent} />
              </div>
              <div>
                <div>
                  <label htmlFor="city">City</label>
                  <input type="text" name='city' value={eventFields.city} onChange={onChangeEvent} required />
                </div>
                <div>
                  <label htmlFor="state">State</label>
                  <input type="text" name="state" id="state" value={eventFields.state} onChange={onChangeEvent} required />
                </div>
              </div>
              <div>
                <div>
                  <label htmlFor="zipcode">ZipCode</label>
                  <input type="text" name="zipcode" id="zipcode" value={eventFields.zipcode} onChange={onChangeEvent} required />
                </div>
                <div>
                  <label htmlFor="country">Country</label>
                  <input type="text" name="country" id="country" value={eventFields.country} onChange={onChangeEvent} required />
                </div>
              </div>
            </div>
          )}
          {error && (<div>{error}</div>)}
          {success && (<div>{success}</div>)}
          <div>
            <button type='submit' disabled={submitting} className={`${submitting ? "bg-gray-400" : "bd-black"}`}>{submitting ? "Submitting..." : isEvent ? "Post Event" : "Post"}</button>
          </div>
        </form>
      </div>
    </>
  )
}

export default CreateView