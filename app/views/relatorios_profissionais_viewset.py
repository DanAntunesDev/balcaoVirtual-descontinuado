from rest_framework.viewsets import ViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from usuarios.permissions.base import IsActiveUser
from usuarios.models.usuario import User

from app.services.relatorios.relatorio_profissional_service import (
    relatorio_profissional,
)


class RelatoriosProfissionaisViewSet(ViewSet):
    """
    Relatórios voltados a profissionais judiciais.
    """

    permission_classes = [
        IsAuthenticated,
        IsActiveUser,
    ]

    def list(self, request):
        if request.user.role != User.Roles.PROFISSIONAL:
            raise PermissionDenied(
                "Apenas profissionais judiciais podem acessar relatórios."
            )

        data_inicio = request.query_params.get("data_inicio")
        data_fim = request.query_params.get("data_fim")

        dados = relatorio_profissional(
            request.user,
            data_inicio=data_inicio,
            data_fim=data_fim,
        )

        return Response(dados)
