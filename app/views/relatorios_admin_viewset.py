from rest_framework.viewsets import ViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from usuarios.permissions.base import IsActiveUser
from usuarios.permissions.permissions import IsAdminOrSuperAdmin


from app.services.relatorios.documentos_admin_report_service import (
    relatorio_documentos_admin,
)

from app.serializers import DocumentosAdminReportSerializer


class RelatoriosAdminViewSet(ViewSet):
    """
    ViewSet responsável por expor relatórios administrativos.

    Aqui eu restrinjo esse endpoint para:
    - SUPERADMIN
    - ADMIN (cartório)

    Cliente não acessa relatório administrativo.
    """

    permission_classes = [
        IsAuthenticated,
        IsActiveUser,
        IsAdminOrSuperAdmin,
    ]

    def documentos(self, request):
        """
        Relatório geral de documentos e SLA.
        """
        dados = relatorio_documentos_admin()
        serializer = DocumentosAdminReportSerializer(dados)
        return Response(serializer.data)
