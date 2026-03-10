from rest_framework.permissions import BasePermission

from usuarios.permissions.cargo_rules import cargo_pode


class PodeReenviarDocumento(BasePermission):
    """Quem pode reenviar documento.

    - cliente: somente se for o dono do agendamento
    - superadmin/admin/cartorio: sempre
    - profissional: depende do cargo_judicial (matriz)
    """

    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return False

        documento = getattr(view, "documento", None)
        if not documento:
            return False

        if user.role in ["superadmin", "admin", "cartorio"]:
            return True

        if user.role == "profissional":
            return cargo_pode(user, "reenviar_documento")

        # cliente
        return documento.agendamento.cliente_id == user.id
