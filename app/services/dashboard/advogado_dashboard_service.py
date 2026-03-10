from django.db.models import Count
from django.utils import timezone

from app.models import Agendamento, DocumentoAgendamento


def dashboard_advogado(usuario):
    """
    Dashboard específico do Advogado.

    Aqui eu:
    - foco apenas nos próprios atendimentos
    - foco em documentos do cliente dele
    """

    agendamentos = Agendamento.objects.filter(profissional=usuario)
    documentos = DocumentoAgendamento.objects.filter(
        agendamento__profissional=usuario
    )

    cards = {
        "meus_agendamentos": agendamentos.count(),
        "documentos_pendentes": documentos.filter(
            status=DocumentoAgendamento.Status.PENDENTE
        ).count(),
        "documentos_reprovados": documentos.filter(
            status=DocumentoAgendamento.Status.REPROVADO
        ).count(),
    }

    documentos_por_status = documentos.values("status").annotate(total=Count("id"))

    return {
        "cards": cards,
        "series": {
            "documentos_por_status": {
                item["status"]: item["total"] for item in documentos_por_status
            },
        },
    }
