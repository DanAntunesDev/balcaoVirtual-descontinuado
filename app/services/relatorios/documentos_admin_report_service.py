from django.db.models import Count, Avg, F, ExpressionWrapper, DurationField
from django.utils import timezone

from app.models import DocumentoAgendamento


def relatorio_documentos_admin():
    """
    Service responsável por gerar o relatório administrativo de documentos.

    Aqui eu concentro:
    - métricas globais
    - indicadores de SLA
    - dados prontos para dashboard
    """

    agora = timezone.now()

    queryset = DocumentoAgendamento.objects.all()

    # Métricas básicas por status
    total = queryset.count()
    pendentes = queryset.filter(status=DocumentoAgendamento.Status.PENDENTE).count()
    aprovados = queryset.filter(status=DocumentoAgendamento.Status.APROVADO).count()
    reprovados = queryset.filter(status=DocumentoAgendamento.Status.REPROVADO).count()

    # SLA
    sla_estourado = queryset.filter(sla_estourado=True).count()

    # Tempo médio de validação (somente documentos validados)
    tempo_medio_validacao = (
        queryset
        .filter(validado_em__isnull=False)
        .annotate(
            tempo_validacao=ExpressionWrapper(
                F("validado_em") - F("criado_em"),
                output_field=DurationField(),
            )
        )
        .aggregate(media=Avg("tempo_validacao"))
        .get("media")
    )

    return {
        "total_documentos": total,
        "pendentes": pendentes,
        "aprovados": aprovados,
        "reprovados": reprovados,
        "sla_estourado": sla_estourado,
        "tempo_medio_validacao": tempo_medio_validacao,
    }
