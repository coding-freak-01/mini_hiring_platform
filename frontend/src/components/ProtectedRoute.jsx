import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

const ProtectedRoute = ({ children, requiredUserType = null }) => {
  const { isAuthenticated, userType } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredUserType && userType !== requiredUserType) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default ProtectedRoute
