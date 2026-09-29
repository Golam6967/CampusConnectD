import { Heart, AlertCircle, Phone, Users, Clock } from 'lucide-react'

export default function EmergencyContacts() {
  const emergencyContacts = [
    {
      id: 1,
      title: 'Campus Medical Center',
      number: '+880 1234-567890',
      available: '24/7',
      icon: <Heart className="h-6 w-6" />
    },
    {
      id: 2,
      title: 'Ambulance Service',
      number: '+880 1234-567891',
      available: '24/7',
      icon: <AlertCircle className="h-6 w-6" />
    },
    {
      id: 3,
      title: 'Campus Security',
      number: '+880 1234-567892',
      available: '24/7',
      icon: <Phone className="h-6 w-6" />
    },
    {
      id: 4,
      title: 'Mental Health Support',
      number: '+880 1234-567893',
      available: 'Mon-Fri: 9AM-5PM',
      icon: <Users className="h-6 w-6" />
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Emergency Hotlines</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {emergencyContacts.map((contact) => (
          <div
            key={contact.id}
            className="group cursor-pointer rounded-2xl bg-white p-6 shadow-lg transition hover:shadow-xl"
          >
            <div className="mb-4 inline-flex rounded-full bg-gradient-to-br from-[#e50914] to-[#b00020] p-3 text-white">
              {contact.icon}
            </div>
            <h3 className="mb-2 font-bold text-gray-800">{contact.title}</h3>
            <p className="mb-2 text-lg font-semibold text-[#e50914]">{contact.number}</p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{contact.available}</span>
            </div>
            <button className="mt-4 w-full rounded-full bg-gradient-to-r from-[#e50914] to-[#b00020] py-2 text-sm font-semibold text-white transition hover:shadow-lg">
              Call Now
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-xl font-bold text-gray-800">Quick Guide</h3>
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#e50914] text-xs font-bold text-white">1</span>
            <span>For life-threatening emergencies, call the Ambulance Service immediately</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#e50914] text-xs font-bold text-white">2</span>
            <span>Provide your exact location and describe the emergency clearly</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#e50914] text-xs font-bold text-white">3</span>
            <span>Stay calm and follow the dispatcher's instructions</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
