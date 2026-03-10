from django.db.models import Q
from django.shortcuts import get_object_or_404

from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from app.models import Auditoria
from app.serializers import AuditoriaSerializer

from usuarios.permissions.base import IsActiveUser


class AuditoriaViewSet(ReadOnlyModelViewSet):
    """
    Auditoria hardened:
    - Apenas leitura
    - Queryset fechado por padrão
    - Escopo obrigatório por role
    - Anti-IDOR (get_object via queryset escopado)
    - Filtros e ordering controlados
    """

    serializer_class = AuditoriaSerializer
    permission_classes = [IsAuthenticated, IsActiveUser]
    queryset = Auditoria.objects.none()  # fechado por padrão

    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["tipo_evento", "usuario_executor", "usuario_afetado"]
    ordering_fields = ["criado_em"]
    ordering = ["-criado_em"]

    def _role(self) -> str:
        return str(getattr(self.request.user, "role", "")).lower()

    def _is_superadmin(self) -> bool:
        u = self.request.user
        return bool(getattr(u, "is_superuser", False)) or self._role() == "superadmin"

    def _is_admin(self) -> bool:
        return self._role() == "admin"

    def _is_profissional(self) -> bool:
        return self._role() in {"profissional", "profissional_judicial", "juiz"}

    def get_queryset(self):
        user = self.request.user
        role = self._role()

        base = (
            Auditoria.objects.select_related("usuario_executor", "usuario_afetado")
            .order_by("-criado_em")
        )

        if self._is_superadmin():
            return base

        if self._is_admin():
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
                return Auditoria.objects.none()

            return base.filter(usuario_afetado__cartorio_id__in=set(cartorios_ids))

        if self._is_profissional():
            return base.filter(Q(usuario_executor=user) | Q(usuario_afetado=user))

        if role in {"cliente", "cartorio"}:
            return Auditoria.objects.none()

        return Auditoria.objects.none()

    def get_object(self):
        return get_object_or_404(self.get_queryset(), pk=self.kwargs["pk"])
