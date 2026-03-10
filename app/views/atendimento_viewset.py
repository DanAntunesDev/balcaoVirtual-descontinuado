from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, ValidationError

from app.models import Atendimento, Agendamento
from app.serializers import AtendimentoSerializer


class AtendimentoViewSet(ModelViewSet):
    """
    Atendimento hardened:
    - Queryset fechado por padrão
    - Escopo obrigatório por role
    - Anti-IDOR real (retrieve/update/delete)
    - Blindagem contra alteração indevida de escopo
    - Escritas atômicas
    """

    serializer_class = AtendimentoSerializer
    permission_classes = [IsAuthenticated]
    queryset = Atendimento.objects.none()

    # -------------------------
    # Helpers
    # -------------------------
    def _role(self):
        return str(getattr(self.request.user, "role", "")).lower()

    def _is_superadmin(self):
        user = self.request.user
        return user.is_superuser or self._role() == "superadmin"

    # -------------------------
    # Queryset scoping
    # -------------------------
    def get_queryset(self):
        user = self.request.user
        role = self._role()

        base = (
            Atendimento.objects
            .select_related("agendamento", "profissional", "usuario", "cartorio")
            .order_by("-id")
        )

        if self._is_superadmin():
            return base

        if role in {"admin", "cartorio"}:
            cartorios_ids = []

            if getattr(user, "cartorio_id", None):
                cartorios_ids.append(user.cartorio_id)

            if hasattr(user, "cartorios_vinculados"):
                try:
                    cartorios_ids.extend(
                        list(user.cartorios_vinculados.values_list("id", flat=True))
                    )
                except Exception:
                    pass

            if not cartorios_ids:
                return Atendimento.objects.none()

            return base.filter(
                agendamento__cartorio_id__in=set(cartorios_ids)
            )

        if role in {"profissional", "profissional_judicial", "juiz"}:
            return base.filter(
                agendamento__profissional=user
            )

        if role == "cliente":
            return base.filter(
                agendamento__cliente=user
            )

        return Atendimento.objects.none()

    # -------------------------
    # Anti-IDOR
    # -------------------------
    def get_object(self):
        return get_object_or_404(self.get_queryset(), pk=self.kwargs["pk"])

    # -------------------------
    # Escrita segura
    # -------------------------
    @transaction.atomic
    def perform_create(self, serializer):
        user = self.request.user
        role = self._role()

        agendamento = serializer.validated_data.get("agendamento")

        if not agendamento:
            raise ValidationError("Agendamento é obrigatório.")

        # Impede criar atendimento fora do escopo do usuário
        if not self._is_superadmin():

            if role in {"admin", "cartorio"}:
                if agendamento.cartorio_id != getattr(user, "cartorio_id", None):
                    raise PermissionDenied("Agendamento fora do seu cartório.")

            if role in {"profissional", "profissional_judicial", "juiz"}:
                if agendamento.profissional_id != user.id:
                    raise PermissionDenied("Você só pode criar atendimentos seus.")

            if role == "cliente":
                if agendamento.cliente_id != user.id:
                    raise PermissionDenied("Você só pode criar atendimento para si.")

        serializer.save()

    @transaction.atomic
    def perform_update(self, serializer):
        instance = self.get_object()

        # Não permite troca de agendamento via update
        if "agendamento" in serializer.validated_data:
            raise ValidationError("Não é permitido alterar o agendamento.")

        serializer.save()
