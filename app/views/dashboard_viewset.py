import logging

from rest_framework.viewsets import ViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from usuarios.permissions.base import IsActiveUser
from app.services.dashboard.dashboard_service import dashboard_por_usuario


logger = logging.getLogger(__name__)


class DashboardViewSet(ViewSet):
    """
    Endpoint único de dashboard.

    - Apenas orquestra chamada do service.
    - Nenhuma regra de negócio aqui.
    - Blindagem contra erro interno.
    """

    permission_classes = [IsAuthenticated, IsActiveUser]

    def list(self, request):
        user = request.user

        if not user or not user.is_authenticated:
            return Response(
                {"detail": "Usuário não autenticado."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            dados = dashboard_por_usuario(user) or {}
            return Response(dados, status=status.HTTP_200_OK)

        except Exception:
            logger.exception(
                "Erro ao gerar dashboard",
                extra={
                    "user_id": getattr(user, "id", None),
                    "role": getattr(user, "role", None),
                },
            )
            return Response(
                {"detail": "Erro ao carregar dashboard."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
