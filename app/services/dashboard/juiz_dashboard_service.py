from django.db.models import Count
from django.utils import timezone

from app.models import Agendamento, DocumentoAgendamento


def dashboard_juiz(usuario):
    """
    Dashboard específico do Juiz.

    Aqui eu:
    - foco em volume geral
    - foco em pendências e SLA
    """

    agendamentos = Agendamento.objects.filter(
        cartorio_id__in=usuario.cartorios_vinculados.values_list("id", flat=True)
    )

    documentos = DocumentoAgendamento.objects.filter(
        agendamento__cartorio_id__in=usuario.cartorios_vinculados.values_list("id", flat=True)
    )

    cards = {
        "agendamentos_totais": agendamentos.count(),
        "documentos_pendentes": documentos.filter(
            status=DocumentoAgendamento.Status.PENDENTE
        ).count(),
        "sla_estourado": documentos.filter(sla_estourado=True).count(),
    }

    documentos_por_cartorio = (
        documentos.values("agendamento__cartorio__nome")
        .annotate(total=Count("id"))
        .order_by("-total")
    )

    return {
        "cards": cards,
        "series": {
            "documentos_por_cartorio": list(documentos_por_cartorio),
        },
    }
