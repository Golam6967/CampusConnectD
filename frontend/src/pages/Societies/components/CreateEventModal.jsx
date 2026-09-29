import { useState } from 'react'
import toast from 'react-hot-toast'

export default function CreateEventModal({ societies, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Workshop',
    date: '',
    time: '',
    venue: '',
    description: '',
    maxParticipants: '',
    registrationDeadline: '',
    image: null,
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const eventCategories = ['Workshop', 'Competition', 'Seminar', 'Other']

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      setFormData({ ...formData, image: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter event title')
      return
    }
    if (!formData.date) {
      toast.error('Please select event date')
      return
    }
    if (!formData.description.trim()) {
      toast.error('Please enter event description')
      return
    }

    // Check if registration deadline is before event date (only if deadline is provided)
    if (formData.registrationDeadline && new Date(formData.registrationDeadline) >= new Date(formData.date)) {
      toast.error('Registration deadline must be before event date')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error creating event:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-gray-100 bg-white p-6">
            <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-gray-100"
              title="Close"
            >
              <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form Content */}
          <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Event Title */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Event Title <span className="text-[#e50914]">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Annual Tech Fest 2026"
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-[#e50914] focus:outline-none focus:ring-2 focus:ring-[#e50914]/20"
                  required
                />
              </div>

              {/* Society and Category Row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">


                {/* Category */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Event Category <span className="text-[#e50914]">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-[#e50914] focus:outline-none focus:ring-2 focus:ring-[#e50914]/20"
                    required
                  >
                    {eventCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date and Time Row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Date */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Event Date <span className="text-[#e50914]">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-[#e50914] focus:outline-none focus:ring-2 focus:ring-[#e50914]/20"
                    required
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Event Time <span className="text-[#e50914]"></span>
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-[#e50914] focus:outline-none focus:ring-2 focus:ring-[#e50914]/20"
                  />
                </div>
              </div>

              {/* Venue */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Venue <span className="text-[#e50914]"></span>
                </label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  placeholder="e.g., IUT Auditorium"
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-[#e50914] focus:outline-none focus:ring-2 focus:ring-[#e50914]/20"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Event Description <span className="text-[#e50914]">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe your event in detail..."
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-[#e50914] focus:outline-none focus:ring-2 focus:ring-[#e50914]/20"
                  required
                />
              </div>

              {/* Max Participants and Registration Deadline Row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Max Participants */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Max Participants <span className="text-[#e50914]"></span>
                  </label>
                  <input
                    type="number"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleChange}
                    min="1"
                    placeholder="e.g., 100"
                    className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-[#e50914] focus:outline-none focus:ring-2 focus:ring-[#e50914]/20"
                  />
                </div>

                {/* Registration Deadline */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Registration Deadline <span className="text-[#e50914]"></span>
                  </label>
                  <input
                    type="date"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    max={formData.date}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 focus:border-[#e50914] focus:outline-none focus:ring-2 focus:ring-[#e50914]/20"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Event Image
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="event-image"
                  />
                  <label
                    htmlFor="event-image"
                    className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-8 transition-colors hover:border-[#e50914] hover:bg-gray-100"
                  >
                    {imagePreview ? (
                      <div className="relative h-48 w-full">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-full w-full rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            setImagePreview(null)
                            setFormData({ ...formData, image: null })
                          }}
                          className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white shadow-lg transition-all hover:bg-red-600"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg className="mb-3 h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-1 text-sm font-semibold text-gray-700">
                          Click to upload event image
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`rounded-xl px-6 py-3 font-bold text-white shadow-lg transition-all ${
                    isSubmitting
                      ? 'cursor-not-allowed bg-gray-400'
                      : 'bg-gradient-to-r from-[#e50914] to-[#b00020] hover:scale-105 hover:shadow-xl'
                  }`}
                >
                  {isSubmitting ? 'Creating Event...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
