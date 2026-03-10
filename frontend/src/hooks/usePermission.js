import { useAuth } from "@/context/AuthContext";
import { PERMISSIONS } from "@/config/permissions";

export function usePermission() {
  const { user } = useAuth();

  const role = user?.role;

  function can(resource, action) {
    if (!role) return false;
    return Boolean(PERMISSIONS[role]?.[resource]?.[action]);
  }

  return { can };
}
