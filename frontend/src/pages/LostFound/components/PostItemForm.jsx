import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { AuthContext } from '../../../context/AuthContext'

export default function PostItemForm({ onSubmit, User }) {
  console.log(User)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageUrl, setImageUrl] = useState('')
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: new Date().toISOString().split('T')[0], // Default to today's date
    location: '',
    phone_number: User?.phone_number,
    facebookId: '',
    image: '',
    whatsappAvailable: false
  })
  useEffect(() => {
    if (User?.phone_number && !formData.phone_number) {
      setFormData(prev => ({
        ...prev,
        phone_number: User.phone_number
      }));
    }
  }, [User]);

  const uploadToImgBB = async (base64Image) => {
    setIsUploadingImage(true);
    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=0f10a53e4adf77920126b0d4c1685fdb`, {
        method: 'POST',
        body: new URLSearchParams({
          image: base64Image
        })
      });
      const data = await response.json();
      if (data.success) {
        setImageUrl(data.data.url);
        setFormData(prev => ({ ...prev, image: data.data.url }));
        setErrors(prev => ({ ...prev, image: '' }));
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('ImgBB upload error:', error);
      setErrors(prev => ({ ...prev, image: 'Failed to upload image. Please try again.' }));
      setImagePreview(null);
    } finally {
      setIsUploadingImage(false);
    }
  };
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
        // Extract base64 without the prefix
        const base64 = reader.result.split(',')[1];
        uploadToImgBB(base64);
      }
      reader.readAsDataURL(file)
    } else {
      setErrors(prev => ({ ...prev, image: 'Please upload an image file' }))
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (!formData.date) {
      newErrors.date = 'Date is required'
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required'
    } else if (!/^\d{10,15}$/.test(formData.phone_number.replace(/[\s-]/g, ''))) {
      newErrors.phone_number = 'Please enter a valid phone number'
    }
    // Image is optional now
    // if (!imageUrl) {
    //   newErrors.image = 'Image upload is required'
    // }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    const toastId = toast.loading('Posting your item...')

    try {
      // Prepare data with image URL
      const submitData = {
        ...formData,
        image: imageUrl || '' // Ensure image URL is included
      }

      console.log('Submitting data:', submitData)

      // Call the parent's onSubmit function
      await onSubmit(submitData)

      // Reset form
      setFormData({
        name: '',
        description: '',
        date: new Date().toISOString().split('T')[0], // Reset to today's date
        location: '',
        phone_number: User?.phone_number || '',
        facebookId: '',
        image: '',
        whatsappAvailable: false
      })
      setImagePreview(null)
      setImageUrl('')

      toast.success('Lost item posted successfully!', { id: toastId })
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Failed to post item. Please try again.', { id: toastId })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-lg animate-[slide-in_700ms_ease-out_both]">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Report Lost Item</h2>
        <p className="mt-1 text-sm text-gray-600">Fill in the details below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Image Upload */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Item Photo <span className="text-gray-500">(Optional - helps with identification)</span>
          </label>
          <div
            className={`relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 ${dragActive
              ? 'border-[#b00020] bg-red-50'
              : errors.image
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 hover:border-[#b00020]'
              }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="absolute placeholder-black inset-0 z-10 cursor-pointer opacity-0"
              aria-label="Upload image"
            />

            {imagePreview ? (
              <div className="relative h-48">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
                {isUploadingImage ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="flex items-center gap-3 rounded-lg bg-white px-4 py-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#b00020] border-t-transparent" />
                      <span className="text-sm font-semibold text-gray-700">Uploading...</span>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                    <p className="font-semibold text-white">Click to change</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center p-6 text-center">
                <svg className={`mb-3 h-12 w-12 ${errors.image ? 'text-red-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mb-1 text-sm font-semibold text-gray-700">
                  Drop image here or click to upload
                </p>
                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
              </div>
            )}
          </div>
          {errors.image && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.image}
            </p>
          )}
        </div>

        {/* Item Name */}
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-semibold text-gray-700">
            Item Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full rounded-xl text-black border-2 px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#b00020] ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#b00020] bg-white'
              }`}
            placeholder="e.g., Black Leather Wallet"
          />
          {errors.name && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.name}
            </p>
          )}
        </div>



        {/* Description */}
        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-semibold text-gray-700">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className={`w-full bg-white text-black resize-none rounded-xl border-2 px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#b00020] ${errors.description ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#b00020]'
              }`}
            placeholder="Provide details about the item and location..."
          />
          {errors.description && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.description}
            </p>
          )}
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="mb-2 block text-sm font-semibold text-gray-700">
            Date Lost <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            className={`w-full rounded-xl border-2 text-black bg-white px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#b00020] ${errors.date ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#b00020]'
              }`}
          />
          {errors.date && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.date}
            </p>
          )}
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="mb-2 block text-sm font-semibold text-gray-700">
            Location <span className="text-red-500">*</span>
          </label>
          <select
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={`w-full rounded-xl border-2 text-black bg-white px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#b00020] ${errors.location ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#b00020]'
              }`}
          >
            <option value="">Select a location</option>
            <option value="Library">Library</option>
            <option value="CDS">CDS</option>
            <option value="AB1">AB1</option>
            <option value="AB2">AB2</option>
            <option value="AB3">AB3</option>
            <option value="Admin building">Admin building</option>
            <option value="Central Plaza">Central Plaza</option>
            <option value="Field">Field</option>
            <option value="Auditorium">Auditorium</option>
            <option value="Medical">Medical</option>
            <option value="Laundry">Laundry</option>
            <option value="Rocket">Rocket</option>
            <option value="Other">Other</option>
          </select>
          {errors.location && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.location}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phone_number" className="mb-2 block text-sm font-semibold text-gray-700">
            Phone Number  <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            className={`w-full rounded-xl text-black border-2 bg-white px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#b00020] ${errors.phone_number ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#b00020]'
              }`}
            placeholder="e.g., 01712345678"
          />
          {errors.phone_number && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.phone_number}
            </p>
          )}
          
          {/* WhatsApp Available Checkbox */}
          <div className="mt-3 flex items-center gap-2">
            <input
              type="checkbox"
              id="whatsappAvailable"
              name="whatsappAvailable"
              checked={formData.whatsappAvailable}
              onChange={(e) => setFormData(prev => ({ ...prev, whatsappAvailable: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-[#b00020] focus:ring-2 focus:ring-[#b00020] focus:ring-offset-0 cursor-pointer"
            />
            <label htmlFor="whatsappAvailable" className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <svg className="h-4 w-4 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span className="font-medium">WhatsApp available on this number</span>
            </label>
          </div>
        </div>

        {/* Facebook ID */}
        {/*<div>*/}
        {/*  <label htmlFor="facebookId" className="mb-2 block text-sm font-semibold text-gray-700">*/}
        {/*    Facebook ID <span className="text-gray-500"></span>*/}
        {/*  </label>*/}
        {/*  <input*/}
        {/*    type="text"*/}
        {/*    id="facebookId"*/}
        {/*    name="facebookId"*/}
        {/*    value={formData.facebookId}*/}
        {/*    onChange={handleChange}*/}
        {/*    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#b00020] focus:border-[#b00020]"*/}
        {/*    placeholder="e.g., facebook.com/yourprofile or your.name"*/}
        {/*  />*/}
        {/*</div>*/}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isUploadingImage}
          className="w-full rounded-xl bg-gradient-to-r from-[#e50914] to-[#b00020] px-6 py-4 font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Posting...</span>
            </div>
          ) : isUploadingImage ? (
            <div className="flex items-center justify-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Uploading Image...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Post Item</span>
            </div>
          )}
        </button>
      </form>
    </div>
  )
}
