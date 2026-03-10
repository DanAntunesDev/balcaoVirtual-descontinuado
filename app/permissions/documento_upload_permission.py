from rest_framework.permissions import BasePermission


class PodeEnviarDocumento(BasePermission):
    """
    Cliente pode enviar documento:
    - precisa ser dono do agendamento
    - agendamento não pode estar CONFIRMADO ou CANCELADO
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        agendamento = getattr(view, "agendamento", None)
        if not agendamento:
            return False

        # só o cliente do agendamento
        if agendamento.cliente_id != user.id:
            return False

        # não permite se finalizado
        if agendamento.status in (
            agendamento.Status.CONFIRMADO,
            agendamento.Status.CANCELADO,
        ):
            return False

        return True
