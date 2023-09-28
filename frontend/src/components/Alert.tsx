import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon'
import ExclamationCircleIcon from '@heroicons/react/24/outline/ExclamationCircleIcon'
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon'
import InformationCircleIcon from '@heroicons/react/24/outline/InformationCircleIcon'
import React from 'react'

type AlertType = 'error' | 'success' | 'warning' | 'info'

interface AlertProps {
  type: AlertType
  children: React.ReactNode
}

const Alert = ({ children, type }: AlertProps) => {
  const bgColor =
    type === 'error'
      ? 'bg-red-50'
      : type === 'success'
      ? 'bg-green-50'
      : type === 'warning'
      ? 'bg-yellow-50'
      : 'bg-blue-50'
  const textColor =
    type === 'error'
      ? 'text-red-900'
      : type === 'success'
      ? 'text-green-900'
      : type === 'warning'
      ? 'text-yellow-900'
      : 'text-blue-900'
  const borderColor =
    type === 'error'
      ? 'border-red-300'
      : type === 'success'
      ? 'border-green-300'
      : type === 'warning'
      ? 'border-yellow-300'
      : 'border-blue-300'
  const icon =
    type === 'error' ? (
      <ExclamationCircleIcon />
    ) : type === 'success' ? (
      <CheckCircleIcon />
    ) : type === 'warning' ? (
      <ExclamationTriangleIcon />
    ) : (
      <InformationCircleIcon />
    )
  return (
    <div
      className={`flex items-center justify-center py-3 px-5 rounded-md border ${bgColor} ${textColor} ${borderColor} text-base text-center`}
    >
      <span className={`w-20 h-20 flex items-center mr-2 ${textColor}`}>{icon}</span>
      {children}
    </div>
  )
}

export default React.memo(Alert)
