import { useAuthStore } from '@/store'
import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

const ProtectedLayout = () => {
  const isAppInitialized = useAuthStore((state) => state.isAppInitialized)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAppInitialized) return 'Loading...'

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default ProtectedLayout
