from rest_framework.permissions import BasePermission

from usuarios.permissions.cargo_rules import cargo_pode


class PodeCriarAgendamento(BasePermission):
    """Quem pode criar agendamento."""

    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return False
        return user.role in ["cliente", "superadmin", "admin", "cartorio", "profissional"]


class PodeEditarAgendamento(BasePermission):
    """Quem pode editar um agendamento existente (dados gerais).

    - superadmin/admin/cartorio: sempre
    - profissional: depende do cargo
    - cliente: por padrão NÃO (evita alterações indevidas via API; cliente usa endpoints específicos no front)
    """

    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return False

        if user.role in ["superadmin", "admin", "cartorio"]:
            return True

        if user.role == "profissional":
            return cargo_pode(user, "editar_agendamento")

        return False


class PodeVerAgendamento(BasePermission):
    """Quem pode ver detalhes do agendamento."""

    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return False

        if user.role in ["superadmin", "admin", "cartorio"]:
            return True

        try:
            agendamento = view.get_object()
        except Exception:
            return False

        if user.role == "cliente":
            return agendamento.cliente_id == user.id

        if user.role == "profissional":
            return (
                agendamento.profissional_id == user.id
                or cargo_pode(user, "editar_agendamento")
                or cargo_pode(user, "confirmar_agendamento")
                or cargo_pode(user, "cancelar_agendamento")
            )

        return False
