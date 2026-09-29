import { useState } from 'react'

export default function ItemCard({ item, index, onDelete, showMarkAsFound = false, isOwnItem = false, isHistory = false }) {
  const [showContact, setShowContact] = useState(false)
  const [copiedPhone, setCopiedPhone] = useState(false)
  const [copiedFacebook, setCopiedFacebook] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
    const facebookValue =
        item.facebookId ??
        item.facebook_id ??
        item.facebook ??
        item.facebook_link ??
        item.facebookUrl ??
        item.facebook_url


    const handleContact = () => {
    setShowContact(!showContact)
    console.log(item.item_id)
  }

  const handleDelete = () => {
    setShowConfirmModal(true)
  }

  const confirmDelete = () => {
    onDelete(item.item_id)
    setShowConfirmModal(false)
  }

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(item.phone_number)
    setCopiedPhone(true)
    setTimeout(() => setCopiedPhone(false), 2000)
  }

  const handleCopyFacebook = () => {
    const fbLink = item.facebookId.startsWith('http') ? item.facebookId : `https://facebook.com/${item.facebookId}`
    navigator.clipboard.writeText(fbLink)
    setCopiedFacebook(true)
    setTimeout(() => setCopiedFacebook(false), 2000)
  }

  return (
    <>
      <div
        className={`group relative overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-lg animate-[pop-in_550ms_cubic-bezier(0.22,1,0.36,1)_both] ${isHistory ? 'opacity-60' : ''
          }`}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 [background-image:radial-gradient(rgba(229,9,20,0.1)_1px,transparent_1px)] [background-size:20px_20px]" aria-hidden="true" />

        {/* Status Badge */}
        {isHistory && (
          <div className="absolute top-3 right-3 z-20">
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold shadow-lg backdrop-blur-sm bg-green-500/90 text-white">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Found
            </span>
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 p-4">
          {/* Item Name */}
          <h3 className="mb-1.5 text-base font-bold text-gray-800 transition-colors duration-300 group-hover:text-[#b00020]">
            {item.name}
          </h3>

          {/* Description */}
          <p className="mb-3 line-clamp-2 text-xs text-gray-600">
            {item.description}
          </p>

          {/* Meta Info */}
          <div className="space-y-1.5 border-t border-gray-100 pt-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium">{item.location}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-3 space-y-2">
            {/* View Image Button */}
            {item.image && (
              <button
                onClick={() => setShowImageModal(true)}
                className="w-full rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-200 active:scale-95"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>View Image</span>
                </div>
              </button>
            )}

            {/* Mark as Found Button - Only show in My Items tab for own items */}
            {showMarkAsFound && !isHistory && (
              <button
                onClick={handleDelete}
                className="w-full rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-3 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:from-red-600 hover:to-red-700 active:scale-95"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete Item</span>
                </div>
              </button>
            )}

            {/* Contact Button (only show for items not owned by current user) */}
            {!isOwnItem && !isHistory && (
              <>
                <button
                  onClick={handleContact}
                  className="w-full rounded-lg bg-gradient-to-r from-[#e50914] to-[#b00020] px-3 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg active:scale-95"
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Contact Owner</span>
                    <svg
                      className={`h-3.5 w-3.5 transition-transform duration-300 ${showContact ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Contact Information Dropdown */}
                {showContact  && (
                  <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-3 space-y-2.5 animate-[slide-down_300ms_ease-in-out]">
                    {item.phone_number && (
                      <div className="flex items-start gap-2.5">
                        <div className="rounded-lg bg-white p-1.5 shadow-sm">
                          <svg className="h-4 w-4 text-[#b00020]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${item.phone_number}`}
                              className="text-xs font-semibold text-gray-800 hover:text-[#b00020] transition-colors truncate"
                            >
                              {item.phone_number}
                            </a>
                            {item.whatsappAvailable && (
                              <a
                                href={`https://wa.me/${item.phone_number.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0 rounded bg-[#25D366] p-1 hover:bg-[#20BA5A] transition-colors shadow-sm"
                                title="Chat on WhatsApp"
                              >
                                <svg className="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                </svg>
                              </a>
                            )}
                            <button
                              onClick={handleCopyPhone}
                              className="ml-auto flex-shrink-0 rounded bg-white px-2 py-0.5 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-[#b00020] transition-colors shadow-sm"
                            >
                              {copiedPhone ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Facebook Profile */}
                    {item.facebookId && (
                      <div className="flex items-start gap-2.5">
                        <div className="rounded-lg bg-white p-1.5 shadow-sm">
                          <svg className="h-4 w-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-500 mb-0.5">Facebook Profile</p>
                          <div className="flex items-center gap-2">
                            <a
                              href={item.facebookId.startsWith('http') ? item.facebookId : `https://facebook.com/${item.facebookId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold text-[#1877F2] hover:underline break-all truncate"
                            >
                              {item.facebookId}
                            </a>
                            <button
                              onClick={handleCopyFacebook}
                              className="ml-auto flex-shrink-0 rounded bg-white px-2 py-0.5 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-[#1877F2] transition-colors shadow-sm"
                            >
                              {copiedFacebook ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && item.image && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-[fade-in_200ms_ease-out]"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] animate-[pop-in_300ms_ease-out]">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-10 right-0 rounded-full bg-white p-2 text-gray-800 hover:bg-gray-200 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={item.image}
              alt={item.name}
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-[fade-in_200ms_ease-out]"
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-[pop-in_300ms_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 rounded-full bg-red-100 p-3">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Item?</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete this item? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold text-sm hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
