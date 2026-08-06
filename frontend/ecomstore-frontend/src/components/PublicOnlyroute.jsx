import { Navigate, Outlet } from 'react-router-dom'
import { isAuthenticated } from '../utils/auth'

const PublicOnlyRoute = () => {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default PublicOnlyRoute