import React from 'react'
import { LoaderIcon } from 'lucide-react'

/**
 * Reusable Loading Component
 * @param {string} text - Loading text to display (default: "Loading")
 * @param {boolean} fullScreen - If true, centers in full screen (default: false)
 * @param {string} size - Size of the loader: 'sm', 'md', 'lg' (default: 'md')
 */
export default function Loading({ text = 'Loading', fullScreen = false, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const containerClasses = fullScreen
    ? 'flex flex-col items-center justify-center min-h-screen bg-gray-50/50'
    : 'flex flex-col items-center justify-center p-12'

  return (
    <div className={containerClasses}>
      <div className="relative">
        {/* Spinner */}
        <div className={`${sizeClasses[size]} rounded-full border-4 border-gray-200 border-t-[#e50914] animate-spin`}></div>
      </div>
      
      {/* Loading Text */}
      <p className={`mt-4 font-medium text-gray-600 ${textSizeClasses[size]} animate-pulse`}>
        {text}...
      </p>
    </div>
  )
}
