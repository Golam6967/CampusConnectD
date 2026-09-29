import { useState, useEffect } from 'react'
import { AuthContext } from '../../../context/AuthContext'

export default function PostRoommateForm({ onSubmit, onCancel, initialData = null }) {
  const { User } = AuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [noRoommates, setNoRoommates] = useState(initialData ? initialData.currentStudents === 0 : false)

  const [formData, setFormData] = useState(initialData || {
    area: '',
    fullAddress: '',
    floor: '',
    currentStudents: 1,
    studentsInfo: [{ studentId: '', batch: '' }],
    rent: '',
    facilities: '',
    phone_number: User?.phone_number || '',
    isGirlsOnly: User?.gender === 'Female',
    whatsappAvailable: false
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (User) {
      setFormData(prev => ({
        ...prev,
        phone_number: prev.phone_number || User.phone_number || '',
        isGirlsOnly: User.gender === 'Female'
      }));
    }
  }, [User]);

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleStudentInfoChange = (index, field, value) => {
    const updatedStudents = [...formData.studentsInfo]
    updatedStudents[index][field] = value
    setFormData(prev => ({
      ...prev,
      studentsInfo: updatedStudents
    }))
  }

  const addStudent = () => {
    setFormData(prev => ({
      ...prev,
      studentsInfo: [...prev.studentsInfo, { studentId: '', batch: '' }],
      currentStudents: prev.currentStudents + 1
    }))
  }

  const removeStudent = (index) => {
    if (formData.studentsInfo.length > 1) {
      const updatedStudents = formData.studentsInfo.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        studentsInfo: updatedStudents,
        currentStudents: prev.currentStudents - 1
      }))
    }
  }

  const handleNoRoommatesToggle = () => {
    const newNoRoommates = !noRoommates
    setNoRoommates(newNoRoommates)

    if (newNoRoommates) {
      setFormData(prev => ({
        ...prev,
        currentStudents: 0,
        studentsInfo: []
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        currentStudents: 1,
        studentsInfo: [{ studentId: '', batch: '' }]
      }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.area.trim()) {
      newErrors.area = 'Area is required'
    }

    if (!formData.fullAddress.trim()) {
      newErrors.fullAddress = 'Full address is required'
    }

    if (!formData.floor.trim()) {
      newErrors.floor = 'Floor number is required'
    }

    if (!formData.rent || formData.rent <= 0) {
      newErrors.rent = 'Valid rent amount is required'
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required'
    } else if (!/^[0-9]{11}$/.test(formData.phone_number.trim())) {
      newErrors.phone_number = 'Must be a valid 11-digit phone number'
    }

    if (!noRoommates) {
      const invalidStudents = formData.studentsInfo.some(
        student => !student.studentId.trim() || !student.batch.trim()
      )
      if (invalidStudents) {
        newErrors.studentsInfo = 'All student IDs and batches are required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1000))

    onSubmit(formData)
    setIsSubmitting(false)

    // Only reset form if creating new (not editing)
    if (!initialData) {
      setNoRoommates(false)
      setFormData({
        area: '',
        fullAddress: '',
        floor: '',
        currentStudents: 1,
        studentsInfo: [{ studentId: '', batch: '' }],
        rent: '',
        facilities: '',
        phone_number: User?.phone_number || '',
        isGirlsOnly: User?.gender === 'Female'
      })
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">
          {initialData ? 'Edit Roommate Ad' : 'Post Roommate Ad'}
        </h3>
        <button
          onClick={onCancel}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Area <span className="text-[#e50914]">*</span>
          </label>
          <input
            type="text"
            name="area"
            value={formData.area}
            onChange={handleChange}
            placeholder="e.g., Board Bazar, Rajendrapur"
            className={`w-full rounded-lg text-black bg-white border-2 px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#e50914]/20 ${errors.area ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#e50914]'
              }`}
          />
          {errors.area && <p className="mt-1 text-xs text-red-600">{errors.area}</p>}
        </div>



          <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Full Address <span className="text-[#e50914]">*</span>
              </label>
              <textarea
                  name="fullAddress"
                  value={formData.fullAddress}
                  onChange={handleChange}
                  placeholder="House/Flat number, Road, detailed location"
                  rows="2"
                  className={`w-full rounded-lg text-black bg-white border-2 px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#e50914]/20 ${errors.fullAddress ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#e50914]'
                  }`}
              />
              {errors.fullAddress && <p className="mt-1 text-xs text-red-600">{errors.fullAddress}</p>}
          </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Floor Number <span className="text-[#e50914]">*</span>
          </label>
          <input
            type="text"
            name="floor"
            value={formData.floor}
            onChange={handleChange}
            placeholder="e.g., 2nd Floor, Ground Floor"
            className={`w-full rounded-lg text-black bg-white border-2 px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#e50914]/20 ${errors.floor ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#e50914]'
              }`}
          />
          {errors.floor && <p className="mt-1 text-xs text-red-600">{errors.floor}</p>}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700">
              Current Roommates Info {!noRoommates && <span className="text-[#e50914]">*</span>}
            </label>
            <button
              type="button"
              onClick={handleNoRoommatesToggle}
              className={`rounded-lg border-2 px-3 py-1.5 text-xs font-semibold transition-all ${noRoommates
                ? 'border-[#e50914] bg-[#e50914] text-white'
                : 'border-gray-300 text-gray-600 hover:border-[#e50914] hover:bg-[#e50914]/5'
                }`}
            >
              {noRoommates ? '✓ No roommates yet' : 'No roommates yet'}
            </button>
          </div>

          {!noRoommates && (
            <>
              <div className="space-y-3">
                {formData.studentsInfo.map((student, index) => (
                  <div key={index} className="rounded-lg border-2 border-gray-100 bg-gray-50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-600">Student {index + 1}</span>
                      {formData.studentsInfo.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStudent(index)}
                          className="text-red-500 transition-colors hover:text-red-700"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={student.studentId}
                        onChange={(e) => handleStudentInfoChange(index, 'studentId', e.target.value)}
                        placeholder="Student ID"
                        className="w-full rounded-lg text-black bg-white border-2 border-gray-200 px-3 py-2 text-sm focus:border-[#e50914] focus:outline-none focus:ring-2 focus:ring-[#e50914]/20"
                      />
                      <input
                        type="text"
                        value={student.batch}
                        onChange={(e) => handleStudentInfoChange(index, 'batch', e.target.value)}
                        placeholder="Batch (e.g., 2020)"
                        className="w-full rounded-lg text-black bg-white border-2 border-gray-200 px-3 py-2 text-sm focus:border-[#e50914] focus:outline-none focus:ring-2 focus:ring-[#e50914]/20"
                      />
                    </div>
                  </div>
                ))}
              </div>
              {errors.studentsInfo && <p className="mt-1 text-xs text-red-600">{errors.studentsInfo}</p>}
              <button
                type="button"
                onClick={addStudent}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:border-[#e50914] hover:bg-[#e50914]/5 hover:text-[#e50914]"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Another Student
              </button>
            </>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Rent Amount (৳) <span className="text-[#e50914]">*</span>
          </label>
          <input
            type="number"
            name="rent"
            value={formData.rent}
            onChange={handleChange}
            placeholder="Enter monthly rent"
            className={`w-full rounded-lg text-black bg-white border-2 px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#e50914]/20 ${errors.rent ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#e50914]'
              }`}
          />
          {errors.rent && <p className="mt-1 text-xs text-red-600">{errors.rent}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Facilities <span className="text-gray-500 text-xs">(Optional)</span>
          </label>
          <textarea
            name="facilities"
            value={formData.facilities}
            onChange={handleChange}
            placeholder="e.g., WiFi, Washing Machine, Geyser, Meal Service, Parking"
            rows="3"
            className="w-full rounded-lg text-black bg-white border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-[#e50914] focus:outline-none focus:ring-2 focus:ring-[#e50914]/20"
          />
        </div>

        {/* Girls Only Checkbox - Fully unreachable/locked for Males */}
        <div>
          <button
            type="button"
            disabled={User?.gender === 'Female' || User?.gender === 'Male'}
            onClick={() => setFormData(prev => ({ ...prev, isGirlsOnly: !prev.isGirlsOnly }))}
            className={`flex w-full items-center gap-3 rounded-lg border-2 px-4 py-3 transition-all ${formData.isGirlsOnly
              ? 'border-pink-500 bg-pink-50'
              : 'border-gray-200 hover:border-gray-300'
              } ${User?.gender === 'Female' || User?.gender === 'Male' ? 'cursor-not-allowed opacity-80' : ''}`}
          >
            <div className={`h-5 w-5 rounded border-2 flex items-center justify-center ${formData.isGirlsOnly
              ? 'border-pink-500 bg-pink-500'
              : 'border-gray-300'
              }`}>
              {formData.isGirlsOnly && (
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="flex-1 text-left">
              <span className={`text-sm font-semibold ${formData.isGirlsOnly ? 'text-pink-700' : 'text-gray-700'}`}>
                Girls Only
              </span>
              <p className="text-xs text-gray-500">
                {User?.gender === 'Female'
                  ? 'Automatically set for female users'
                  : User?.gender === 'Male'
                    ? 'General listing (Restricted for male profiles)'
                    : 'This accommodation is for female students only'}
              </p>
            </div>
          </button>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Contact Number <span className="text-[#e50914]">*</span>
          </label>
          <input
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            placeholder="01XXXXXXXXX"
            maxLength="11"
            className={`w-full rounded-lg text-black bg-white border-2 px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#e50914]/20 ${errors.phone_number ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#e50914]'
              }`}
          />
          {errors.phone_number && <p className="mt-1 text-xs text-red-600">{errors.phone_number}</p>}
          
          {/* WhatsApp Available Checkbox */}
          <div className="mt-3 flex items-center gap-2">
            <input
              type="checkbox"
              id="whatsappAvailable"
              name="whatsappAvailable"
              checked={formData.whatsappAvailable}
              onChange={(e) => setFormData(prev => ({ ...prev, whatsappAvailable: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-[#e50914] focus:ring-2 focus:ring-[#e50914] focus:ring-offset-0 cursor-pointer"
            />
            <label htmlFor="whatsappAvailable" className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <svg className="h-4 w-4 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span className="font-medium">WhatsApp available on this number</span>
            </label>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#e50914] to-[#b00020] px-6 py-3.5 font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting 
              ? (initialData ? "Updating Ad..." : "Posting Ad...") 
              : (initialData ? "Update Advertisement" : "Post Advertisement")}
          </button>
        </div>
      </form>
    </div>
  )
}