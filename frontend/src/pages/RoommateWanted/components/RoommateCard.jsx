import { useState } from 'react'
import { AuthContext } from '../../../context/AuthContext'

export default function RoommateCard({ listing, onCancel, onEdit, showActions = false }) {
  const { User } = AuthContext();
  const [copied, setCopied] = useState(false)

  const isOwner = User?.users_id === listing.postedBy;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getDaysAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    return `${diffDays} days ago`
  }

  return (
    <div className="group overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#e50914] to-[#b00020] p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="text-xl font-bold">{listing.area}</h3>
              {listing.isGirlsOnly && (
                <span className="rounded-full bg-pink-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                  Girls Only
                </span>
              )}
            </div>
            <p className="text-sm text-white/90">{listing.fullAddress}</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white/20 px-3 py-1 text-sm backdrop-blur-sm">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {listing.floor}
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold">৳{listing.rent.toLocaleString()}</div>
            <div className="text-sm text-white/80">per month</div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="mb-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <svg className="h-5 w-5 text-[#e50914]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Current Roommates ({listing.currentStudents})
          </div>

          {listing.currentStudents === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center">
              <p className="text-sm font-medium text-gray-600">No roommates yet</p>
              <p className="mt-1 text-xs text-gray-500">Looking for the first roommate!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {listing.studentsInfo.map((student, index) => (
                <div
                  key={index}
                  className="rounded-lg border-2 border-gray-100 bg-gray-50 p-3 transition-all hover:border-[#e50914]/30 hover:bg-[#e50914]/5"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#e50914] to-[#b00020] text-xs font-bold text-white">
                      {student.batch}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-xs font-semibold text-gray-900">{student.studentId}</div>
                      <div className="text-xs text-gray-500">Batch {student.batch}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {listing.facilities && listing.facilities.trim() && (
          <div className="mb-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <svg className="h-5 w-5 text-[#e50914]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Facilities
            </div>
            <div className="rounded-lg border-2 border-gray-100 bg-gray-50 p-4">
              <p className="text-sm text-gray-700">{listing.facilities}</p>
            </div>
          </div>
        )}

        {/* Contact & Cancel Action */}
        <div className="border-t-2 border-gray-100 pt-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Posted {getDaysAgo(listing.postedDate)}
            </div>
            <div className="text-sm font-medium text-gray-700">
              by {listing.userName}
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 flex gap-2">
              <button
                onClick={() => copyToClipboard(listing.phone_number)}
                className="group/btn relative flex-1 overflow-hidden rounded-xl bg-gradient-to-r from-[#e50914] to-[#b00020] px-4 py-3 text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-[0.98]"
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {copied ? (
                    <>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="font-semibold">{listing.phone_number}</span>
                      <svg className="h-5 w-5 transition-transform group-hover/btn:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </>
                  )}
                </div>
                <div className="absolute inset-0 -z-0 bg-white opacity-0 transition-opacity group-hover/btn:opacity-10" />
              </button>

              {listing.whatsappAvailable && !showActions && (
                <a
                  href={`https://wa.me/${listing.phone_number.replace(/\\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-xl bg-[#25D366] px-4 py-3 text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#20BA5A] hover:shadow-xl active:translate-y-0 active:scale-[0.98]"
                  title="Chat on WhatsApp"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </a>
              )}
            </div>

            {isOwner && showActions && (
              <>
                <button
                  onClick={() => onEdit(listing)}
                  className="flex w-[15%] items-center justify-center rounded-xl border-2 border-blue-100 bg-blue-50 text-blue-600 transition-all hover:bg-blue-100 hover:text-blue-700"
                  title="Edit Listing"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => onCancel(listing.id)}
                  className="flex w-[15%] items-center justify-center rounded-xl border-2 border-red-100 bg-red-50 text-red-600 transition-all hover:bg-red-100 hover:text-red-700"
                  title="Cancel Listing"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}