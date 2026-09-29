import { useState, useMemo } from 'react'
import EventDrawer from './EventDrawer'

export default function EventCalendar({ events, onEventRegister, onEventUnregister, societies }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [filters, setFilters] = useState({
    society: 'all',
    category: 'all',
  })

  // Calendar Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Calendar Calculations
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const startDate = new Date(monthStart)
  startDate.setDate(startDate.getDate() - startDate.getDay())
  const endDate = new Date(monthEnd)
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))

  // Generate calendar days
  const calendarDays = []
  const currentDay = new Date(startDate)
  while (currentDay <= endDate) {
    calendarDays.push(new Date(currentDay))
    currentDay.setDate(currentDay.getDate() + 1)
  }

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Convert both to strings for proper ObjectId comparison
      if (filters.society !== 'all' && String(event.societyId) !== String(filters.society)) {
        return false
      }
      if (filters.category !== 'all' && event.category !== filters.category) {
        return false
      }
      return true
    })
  }, [events, filters])

  // Get events for a specific day
  const getEventsForDay = (day) => {
    return filteredEvents.filter((event) => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear()
      )
    })
  }

  const handleEventClick = (event) => {
    // Ensure event has id field for EventDrawer
    const eventWithId = {
      ...event,
      id: event._id || event.id
    }
    setSelectedEvent(eventWithId)
    setDrawerOpen(true)
  }

  const isToday = (day) => {
    const today = new Date()
    return (
      day.getDate() === today.getDate() &&
      day.getMonth() === today.getMonth() &&
      day.getFullYear() === today.getFullYear()
    )
  }

  const isCurrentMonth = (day) => {
    return day.getMonth() === currentDate.getMonth()
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const eventCategories = ['Workshop', 'Competition', 'Seminar', 'Other']

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Sidebar - Filters */}
      <div className="w-full lg:w-72 flex-shrink-0">
        <div className="sticky top-4 rounded-2xl bg-white p-6 shadow-lg">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Filters</h3>

          {/* Society Filter */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Society
            </label>
            <select
              value={filters.society}
              onChange={(e) => setFilters({ ...filters, society: e.target.value })}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-[#e50914] focus:outline-none focus:ring-2 focus:ring-[#e50914]/20"
            >
              <option value="all">All Societies</option>
              {societies.map((society) => (
                <option key={society.id} value={society.id}>
                  {society.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Event Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-[#e50914] focus:outline-none focus:ring-2 focus:ring-[#e50914]/20"
            >
              <option value="all">All Categories</option>
              {eventCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          <button
            onClick={() => setFilters({ society: 'all', category: 'all' })}
            className="w-full rounded-xl border-2 border-[#e50914] px-4 py-2.5 text-sm font-semibold text-[#e50914] transition-all hover:bg-[#e50914] hover:text-white"
          >
            Reset Filters
          </button>

          {/* Legend */}
          <div className="mt-8 border-t-2 border-gray-100 pt-6">
            <h4 className="mb-3 text-sm font-bold text-gray-900">Legend</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-700"></div>
                <span className="text-gray-600">IUTCS</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-600">IUTCBS</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-gray-600">IUTPS</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                <span className="text-gray-600">IUTDS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1">
        <div className="rounded-2xl bg-white shadow-lg">
          {/* Calendar Header */}
          <div className="flex items-center justify-between border-b-2 border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={goToPreviousMonth}
                className="rounded-lg bg-gray-100 p-2 transition-colors hover:bg-gray-200"
                title="Previous Month"
              >
                <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goToToday}
                className="rounded-lg bg-gradient-to-r from-[#e50914] to-[#b00020] px-4 py-2 text-sm font-semibold text-white transition-all hover:shadow-lg"
              >
                Today
              </button>
              <button
                onClick={goToNextMonth}
                className="rounded-lg bg-gray-100 p-2 transition-colors hover:bg-gray-200"
                title="Next Month"
              >
                <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 border-b-2 border-gray-100 bg-gray-50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="p-4 text-center text-sm font-bold text-gray-600"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const dayEvents = getEventsForDay(day)
              const isTodayDate = isToday(day)
              const isCurrentMonthDate = isCurrentMonth(day)

              return (
                <div
                  key={index}
                  className={`min-h-[120px] border-b border-r border-gray-100 p-2 transition-colors hover:bg-gray-50 ${
                    !isCurrentMonthDate ? 'bg-gray-50/50' : ''
                  }`}
                >
                  <div
                    className={`mb-2 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                      isTodayDate
                        ? 'bg-gradient-to-r from-[#e50914] to-[#b00020] text-white'
                        : isCurrentMonthDate
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    }`}
                  >
                    {day.getDate()}
                  </div>

                  {/* Events for this day */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => {
                      // Function to get color based on society name
                      const getSocietyColor = (societyName) => {
                        const name = (societyName || '').toUpperCase().replace(/[-\s]/g, '')
                        if (name.includes('IUTCS') || name.includes('CS')) return 'bg-red-700'
                        if (name.includes('CBS')) return 'bg-blue-500'
                        if (name.includes('IUTPS') || name.includes('PS')) return 'bg-green-500'
                        if (name.includes('IUTDS') || name.includes('DS')) return 'bg-orange-500'
                        return 'bg-gray-500' // Default color
                      }

                      return (
                        <button
                          key={event.id}
                          onClick={() => handleEventClick(event)}
                          className={`w-full rounded-md ${
                            getSocietyColor(event.societyName)
                          } px-2 py-1 text-left text-xs font-medium text-white transition-all hover:scale-105 hover:shadow-md`}
                        >
                          <div className="truncate">{event.title}</div>
                        </button>
                      )
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-xs font-semibold text-gray-500">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Event Drawer */}
      {selectedEvent && (
        <EventDrawer
          event={selectedEvent}
          isOpen={drawerOpen}
          onClose={() => {
            setDrawerOpen(false)
            setTimeout(() => setSelectedEvent(null), 300)
          }}
          onRegister={onEventRegister}
          onUnregister={onEventUnregister}
        />
      )}
    </div>
  )
}
