import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import Header from '../../components/Header'
import GoBackButton from '../../components/GoBackButton'
import EmergencyContacts from './components/EmergencyContacts'
import BloodBank from './components/BloodBank'
import BloodRequests from './components/BloodRequests'
import Footer from '../../components/Footer'

export default function MedicalSupport() {
  const [activeTab, setActiveTab] = useState('emergency')

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-red-50 to-white">
      <Header showMenuButton={false} />
      
      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <GoBackButton />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                  Campus Blood Support
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Emergency contacts, blood bank, and donation requests
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('emergency')}
              className={`whitespace-nowrap rounded-xl px-6 py-3 font-semibold transition shadow-md ${
                activeTab === 'emergency'
                  ? 'bg-gradient-to-r from-[#e50914] to-[#b00020] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Emergency Contacts
            </button>
            <button
              onClick={() => setActiveTab('blood')}
              className={`whitespace-nowrap rounded-xl px-6 py-3 font-semibold transition shadow-md ${
                activeTab === 'blood'
                  ? 'bg-gradient-to-r from-[#e50914] to-[#b00020] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Blood Bank
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`whitespace-nowrap rounded-xl px-6 py-3 font-semibold transition shadow-md ${
                activeTab === 'alerts'
                  ? 'bg-gradient-to-r from-[#e50914] to-[#b00020] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              View Blood Requests
            </button>
          </div>

          {activeTab === 'emergency' && <EmergencyContacts />}
          {activeTab === 'blood' && <BloodBank />}
          {activeTab === 'alerts' && <BloodRequests />}
        </div>
      </main>

      <Footer />
    </div>
  )
}
