from rest_framework.permissions import BasePermission

from usuarios.permissions.cargo_rules import cargo_pode


class PodeValidarDocumento(BasePermission):
    """Quem pode validar documento.

    - superadmin/admin/cartorio: sempre
    - profissional: depende do cargo_judicial (matriz de poderes)
    - cliente: nunca
    """

    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return False

        if getattr(user, "role", None) == "cliente":
            return False

        if user.role in ["superadmin", "admin", "cartorio"]:
            return True

        if user.role == "profissional":
            return cargo_pode(user, "validar_documento")

        return False
