export default function EventDrawer({ event, isOpen, onClose, onRegister, onUnregister }) {
  if (!event) return null

  const formatDate = (date) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getAvailabilityColor = () => {
    if (!event.maxParticipants) return 'text-gray-600'
    const percentage = (event.currentParticipants / event.maxParticipants) * 100
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 70) return 'text-yellow-600'
    return 'text-green-600'
  }

  const spotsLeft = event.maxParticipants ? event.maxParticipants - event.currentParticipants : null

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full transform bg-white shadow-2xl transition-transform duration-300 ease-in-out sm:w-[480px] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Content */}
        <div className="flex h-full flex-col">
          {/* Header with Close Button */}
          <div className="flex items-center justify-between border-b-2 border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900">Event Details</h3>
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

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Event Image */}
            <div className="relative h-64 w-full overflow-hidden bg-gray-100">
              {event.imageUrl && event.imageUrl.trim() !== '' && !event.imageUrl.includes('placeholder') ? (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gray-100"></div>
              )}
              {/* Category Badge */}
              <div className="absolute right-4 top-4">
                <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-gray-900 shadow-lg backdrop-blur-sm">
                  {event.category}
                </span>
              </div>
            </div>

            <div className="p-6">
              {/* Event Title */}
              <h2 className="mb-2 text-2xl font-extrabold text-gray-900">
                {event.title}
              </h2>

              {/* Host Society */}
              <div className="mb-6 flex items-center gap-2">
                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-semibold text-gray-700">{event.societyName}</span>
              </div>

              {/* Event Details Grid */}
              <div className="mb-6 space-y-4">
                {/* Date & Time */}
                <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
                  <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#e50914]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Date & Time</div>
                    <div className="mt-1 text-sm text-gray-600">{formatDate(event.date)}</div>
                    <div className="text-sm text-gray-600">{event.time}</div>
                  </div>
                </div>

                {/* Venue */}
                <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
                  <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#e50914]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Venue</div>
                    <div className="mt-1 text-sm text-gray-600">{event.venue}</div>
                  </div>
                </div>

                {/* Registration Deadline */}
                {event.registrationDeadline && (
                  <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#e50914]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Registration Deadline</div>
                      <div className="mt-1 text-sm text-gray-600">
                        {formatDate(event.registrationDeadline)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Availability */}
                {event.maxParticipants && (
                  <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
                  <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#e50914]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">Available Spots</div>
                      <div className={`mt-1 text-sm font-semibold ${getAvailabilityColor()}`}>
                        {spotsLeft} of {event.maxParticipants} spots remaining
                      </div>
                      {/* Progress Bar */}
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#e50914] to-[#b00020] transition-all"
                          style={{
                            width: `${(event.currentParticipants / event.maxParticipants) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h4 className="mb-2 text-sm font-bold text-gray-900">About This Event</h4>
                <p className="text-sm leading-relaxed text-gray-600">{event.description}</p>
              </div>

              {/* Additional Info */}
              {event.maxParticipants && spotsLeft === 0 && (
                <div className="mb-6 rounded-xl bg-red-50 p-4">
                  <div className="flex items-center gap-2 text-red-800">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-sm font-semibold">This event is fully booked</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer with Register Button */}
          {(event.registrationDeadline || event.maxParticipants) && (
            <div className="border-t-2 border-gray-100 p-6">
              {event.isRegistered ? (
                <div className="space-y-3">
                  {/* Registered Status Badge */}
                  <div className="flex items-center justify-center gap-2 rounded-xl bg-green-50 px-4 py-3">
                    <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-semibold text-green-700">You are registered for this event</span>
                  </div>
                  {/* Cancel Registration Button */}
                  <button
                    onClick={() => onUnregister(event.id)}
                    className="w-full rounded-xl border-2 border-red-600 bg-white px-6 py-3.5 font-bold text-red-600 shadow-sm transition-all hover:bg-red-50 hover:shadow-md"
                  >
                    Cancel Registration
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onRegister(event.id)}
                  disabled={event.maxParticipants && spotsLeft === 0}
                  className={`w-full rounded-xl px-6 py-3.5 font-bold text-white shadow-lg transition-all ${
                    event.maxParticipants && spotsLeft === 0
                      ? 'cursor-not-allowed bg-gray-400'
                      : 'bg-gradient-to-r from-[#e50914] to-[#b00020] hover:shadow-xl hover:scale-105'
                  }`}
                >
                  {event.maxParticipants && spotsLeft === 0 ? 'Event Full' : 'Register for Event'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
