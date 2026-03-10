from rest_framework.viewsets import ViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from usuarios.permissions.base import IsActiveUser
from app.services.historico_cliente_service import historico_cliente
from app.serializers import HistoricoClienteSerializer
from usuarios.models.usuario import User


class HistoricoClienteViewSet(ViewSet):
    """
    Endpoint responsável por expor o histórico do cliente.

    Apenas clientes podem acessar este endpoint.
    """

    permission_classes = [
        IsAuthenticated,
        IsActiveUser,
    ]

    def list(self, request):
        if request.user.role != User.Role.CLIENTE:
            raise PermissionDenied(
                "Apenas clientes podem acessar o histórico."
            )

        dados = historico_cliente(request.user)
        serializer = HistoricoClienteSerializer(dados)
        return Response(serializer.data)
