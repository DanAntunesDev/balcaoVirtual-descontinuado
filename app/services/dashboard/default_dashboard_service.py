from django.db.models import Count
from django.utils import timezone

from app.models import Agendamento, Atendimento, DocumentoAgendamento


def dashboard_default(usuario):
    """
    Dashboard padrão para:
    - SuperAdmin
    - Admin
    - Cartório
    - Cliente
    """

    agendamentos = Agendamento.objects.all()
    atendimentos = Atendimento.objects.all()
    documentos = DocumentoAgendamento.objects.all()

    # Escopo por papel
    if usuario.role == usuario.Role.ADMIN:
        cartorios_ids = list(usuario.cartorios_vinculados.values_list("id", flat=True))
        if usuario.cartorio_id:
            cartorios_ids.append(usuario.cartorio_id)

        agendamentos = agendamentos.filter(cartorio_id__in=cartorios_ids)
        atendimentos = atendimentos.filter(agendamento__cartorio_id__in=cartorios_ids)
        documentos = documentos.filter(agendamento__cartorio_id__in=cartorios_ids)

    elif usuario.role == usuario.Role.CARTORIO:
        agendamentos = agendamentos.filter(cartorio=usuario.cartorio)
        atendimentos = atendimentos.filter(agendamento__cartorio=usuario.cartorio)
        documentos = documentos.filter(agendamento__cartorio=usuario.cartorio)

    elif usuario.role == usuario.Role.CLIENTE:
        agendamentos = agendamentos.filter(cliente=usuario)
        atendimentos = atendimentos.filter(agendamento__cliente=usuario)
        documentos = documentos.filter(agendamento__cliente=usuario)

    # Cards
    cards = {
        "agendamentos": agendamentos.count(),
        "atendimentos": atendimentos.count(),
        "documentos_pendentes": documentos.filter(
            status=DocumentoAgendamento.Status.PENDENTE
        ).count(),
        "documentos_reprovados": documentos.filter(
            status=DocumentoAgendamento.Status.REPROVADO
        ).count(),
    }

    # Série: últimos 7 dias
    hoje = timezone.now().date()
    dias = [hoje - timezone.timedelta(days=i) for i in range(6, -1, -1)]

    ag_por_dia = [
        {
            "data": dia.isoformat(),
            "total": agendamentos.filter(data_hora__date=dia).count(),
        }
        for dia in dias
    ]

    documentos_por_status = documentos.values("status").annotate(total=Count("id"))

    return {
        "cards": cards,
        "series": {
            "agendamentos_por_dia": ag_por_dia,
            "documentos_por_status": {
                item["status"]: item["total"] for item in documentos_por_status
            },
        },
    }
