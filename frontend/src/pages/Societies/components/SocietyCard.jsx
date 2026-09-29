export default function SocietyCard({ society, onClick }) {
  const hasValidImage = (url) => {
    return url && url.trim() !== '' && !url.includes('placeholder')
  }

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
    >
      {/* Cover Photo */}
      <div className="relative h-40 overflow-hidden bg-gray-100">
        {hasValidImage(society.coverPhoto) ? (
          <img
            src={society.coverPhoto}
            alt={society.name}
            className="h-full w-full object-cover opacity-80 transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-gray-100"></div>
        )}
      </div>

      {/* Society Logo - Overlapping */}
      <div className="relative px-6">
        <div className="absolute -top-10 left-6">
          <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-white shadow-lg">
            {hasValidImage(society.logo) ? (
              <img
                src={society.logo}
                alt={`${society.name} logo`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-white"></div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6 pt-14">
        {/* Society Name */}
        <h3 className="mb-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-[#e50914]">
          {society.name}
        </h3>

        {/* Description */}
        <p className="mb-4 line-clamp-2 text-sm text-gray-600">
          {society.description}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-sm font-semibold">{society.memberCount} followers</span>
          </div>

          {/* Follow Status */}
          {society.isFollowing ? (
            <span className="flex items-center gap-1 text-sm font-semibold text-[#e50914]">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Following
            </span>
          ) : null}
        </div>

        {/* View Button */}
        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#e50914]">
          <span>View Society</span>
          <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  )
}
