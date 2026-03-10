from __future__ import annotations

from typing import Any, Optional

from rest_framework.permissions import BasePermission


def _role(user: Any) -> str:
    return str(getattr(user, "role", "") or "").lower()


class IsAuthenticatedAndActive(BasePermission):
    """
    Autenticado e ativo.
    """

    message = "Usuário não autenticado ou inativo."

    def has_permission(self, request, view) -> bool:
        user = getattr(request, "user", None)
        return bool(user and getattr(user, "is_authenticated", False) and getattr(user, "is_active", True))


class IsActiveUser(BasePermission):
    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        return bool(user and getattr(user, "is_active", False))

class IsSuperAdmin(BasePermission):
    message = "Acesso permitido apenas para SuperAdmin."

    def has_permission(self, request, view) -> bool:
        user = getattr(request, "user", None)
        if not user or not getattr(user, "is_authenticated", False):
            return False
        return _role(user) == "superadmin" or bool(getattr(user, "is_superuser", False))


class IsAdmin(BasePermission):
    message = "Acesso permitido apenas para Admin."

    def has_permission(self, request, view) -> bool:
        user = getattr(request, "user", None)
        if not user or not getattr(user, "is_authenticated", False):
            return False
        return _role(user) == "admin"


class IsAdminOrSuperAdmin(BasePermission):
    message = "Acesso permitido apenas para Admin/SuperAdmin."

    def has_permission(self, request, view) -> bool:
        user = getattr(request, "user", None)
        if not user or not getattr(user, "is_authenticated", False):
            return False
        role = _role(user)
        return role in {"admin", "superadmin"} or bool(getattr(user, "is_superuser", False))


class CanBase(BasePermission):
    """
    Base para permissões por 'scope' (ação).
    Use via Can("usuario:criar") no permission_classes.

    Ex:
        permission_classes = [IsAuthenticated, Can("usuario:criar")]
    """

    required_scope: Optional[str] = None
    message = "Sem permissão para executar esta ação."

    def __init__(self, scope: str | None = None):
        if scope:
            self.required_scope = scope

    def has_permission(self, request, view) -> bool:
        if not self.required_scope:
            return True
        user = getattr(request, "user", None)
        if not user or not getattr(user, "is_authenticated", False):
            return False

        # Import local pra evitar ciclo (policy_engine importa cargo_matrix, etc.)
        from .policy_engine import can

        return can(user, self.required_scope)