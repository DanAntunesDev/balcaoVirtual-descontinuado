from django.db.models import Count

from app.models import Agendamento, DocumentoAgendamento
from app.services.relatorios.relatorio_base_service import (
    aplicar_filtro_periodo,
)


def relatorio_profissional(usuario, data_inicio=None, data_fim=None):
    """
    Relatório de produtividade do profissional judicial.
    """

    agendamentos = Agendamento.objects.filter(profissional=usuario)
    documentos = DocumentoAgendamento.objects.filter(
        agendamento__profissional=usuario
    )

    agendamentos = aplicar_filtro_periodo(
        agendamentos, data_inicio, data_fim
    )
    documentos = aplicar_filtro_periodo(
        documentos, data_inicio, data_fim
    )

    return {
        "resumo": {
            "agendamentos": agendamentos.count(),
            "documentos_pendentes": documentos.filter(
                status=DocumentoAgendamento.Status.PENDENTE
            ).count(),
            "documentos_reprovados": documentos.filter(
                status=DocumentoAgendamento.Status.REPROVADO
            ).count(),
            "sla_estourado": documentos.filter(
                sla_estourado=True
            ).count(),
        },
        "documentos_por_status": {
            item["status"]: item["total"]
            for item in documentos.values("status").annotate(total=Count("id"))
        },
    }
