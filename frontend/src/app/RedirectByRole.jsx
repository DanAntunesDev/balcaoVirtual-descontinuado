import { Navigate } from "react-router-dom"
import { useAuth } from "../domain/auth/useAuth"
import { ROLES } from "../constants/roles"

export default function RedirectByRole() {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  const role = user.role?.toLowerCase()

  switch (role) {
    case ROLES.SUPERADMIN:
      return <Navigate to="/superadmin" replace />
    case ROLES.CLIENTE:
      return <Navigate to="/cliente" replace />
    case ROLES.ADMIN:
      return <Navigate to="/admin" replace />
    case ROLES.CARTORIO:
      return <Navigate to="/cartorio" replace />
    case ROLES.PROFISSIONAL:
      return <Navigate to="/profissional" replace />
    default:
      return <Navigate to="/" replace />
  }
}