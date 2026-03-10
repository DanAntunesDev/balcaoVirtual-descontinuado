from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError as DRFValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from app.models import Agendamento
from app.serializers import AgendamentoSerializer
from app.services.agendamento.agendamento_service import AgendamentoService
from usuarios.permissions.permissions import IsAdminOrSuperAdmin
from app.permissions.agendamento_permission import (
    PodeCriarAgendamento,
    PodeEditarAgendamento,
    PodeVerAgendamento,
)


class AgendamentoViewSet(ModelViewSet):
    """Agendamento hardened."""

    serializer_class = AgendamentoSerializer
    permission_classes = [IsAuthenticated]
    queryset = Agendamento.objects.none()

    def _role(self):
        return str(getattr(self.request.user, "role", "") or "").lower()

    # -------------------------
    # Permissions
    # -------------------------
    def get_permissions(self):
        if self.action == "list":
            return [IsAuthenticated(), IsAdminOrSuperAdmin()]
        if self.action == "create":
            return [IsAuthenticated(), PodeCriarAgendamento()]
        if self.action in {"update", "partial_update", "destroy"}:
            return [IsAuthenticated(), PodeEditarAgendamento()]
        if self.action == "retrieve":
            return [IsAuthenticated(), PodeVerAgendamento()]
        if self.action == "cancelar":
            return [IsAuthenticated()]
        return super().get_permissions()

    # -------------------------
    # Queryset
    # -------------------------
    def get_queryset(self):
        user = self.request.user
        role = self._role()

        base = (
            Agendamento.objects
            .select_related("cliente", "profissional", "cartorio")
            .order_by("-data_hora")
        )

        if role == "superadmin" or user.is_superuser:
            return base

        if role == "cliente":
            return base.filter(cliente=user)

        if role in {"profissional", "profissional_judicial", "juiz"}:
            return base.filter(profissional=user)

        if role in {"admin", "cartorio"}:
            if not getattr(user, "cartorio_id", None):
                return Agendamento.objects.none()
            return base.filter(cartorio_id=user.cartorio_id)

        return Agendamento.objects.none()

    def get_object(self):
        return get_object_or_404(self.get_queryset(), pk=self.kwargs["pk"])

    # -------------------------
    # Atomic service calls
    # -------------------------
    @transaction.atomic
    def perform_create(self, serializer):
        """Criação via service (atômico)."""
        service = AgendamentoService(self.request.user)
        agendamento = service.create_agendamento(data=serializer.validated_data)
        serializer.instance = agendamento

    @transaction.atomic
    def perform_update(self, serializer):
        """Update via service (atômico)."""
        service = AgendamentoService(self.request.user)
        agendamento = service.update_agendamento(
            instance=self.get_object(),
            data=serializer.validated_data,
        )
        serializer.instance = agendamento

    # -------------------------
    # Cliente: cancelar (sem PATCH genérico)
    # POST /api/v1/agendamentos/{id}/cancelar/
    # -------------------------
    @action(detail=True, methods=["post"], url_path="cancelar")
    def cancelar(self, request, pk=None):
        role = self._role()
        instance = self.get_object()
        service = AgendamentoService(request.user)

        try:
            if role == "cliente":
                agendamento = service.cancel_agendamento_cliente(instance=instance)
            else:
                agendamento = service.update_agendamento(
                    instance=instance,
                    data={"status": Agendamento.Status.CANCELADO},
                )
        except DjangoValidationError as e:
            detail = getattr(e, "message_dict", None) or getattr(e, "messages", None) or [str(e)]
            raise DRFValidationError(detail)

        serializer = self.get_serializer(agendamento)
        return Response(serializer.data)