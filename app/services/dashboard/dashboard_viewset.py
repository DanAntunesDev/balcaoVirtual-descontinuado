from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from app.services.dashboard.dashboard_service import dashboard_por_usuario


class DashboardViewSet(viewsets.ViewSet):
    """
    GET /api/v1/dashboard/
    Retorna payload consolidado conforme role do usuário autenticado.
    """

    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        dados = dashboard_por_usuario(request.user)
        return Response(dados, status=status.HTTP_200_OK)
