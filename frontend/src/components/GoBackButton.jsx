import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function GoBackButton({ theme = 'default' }) {
  const navigate = useNavigate()

  const themeClasses = {
    default: 'bg-white shadow-md hover:shadow-lg hover:bg-[#e50914] text-gray-700 hover:text-white',
    light: 'bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl hover:bg-white text-gray-900'
  }

  return (
    <button
      onClick={() => navigate(-1)}
      className={`mb-4 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 group active:scale-95 ${themeClasses[theme]}`}
      aria-label="Go back"
    >
      <ArrowLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
    </button>
  )
}
