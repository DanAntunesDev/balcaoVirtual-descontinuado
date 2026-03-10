from app.models import DocumentoAgendamento


def atualizar_status_agendamento(agendamento):
    """
    Atualiza e salva o status do agendamento baseado nos documentos.
    """

    documentos = agendamento.documentos.all()

    if not documentos.exists():
        agendamento.status = "pendente"
        agendamento.save(update_fields=["status"])
        return

    # Se houver algum reprovado → rejeitado
    if documentos.filter(
        status=DocumentoAgendamento.Status.REPROVADO
    ).exists():
        agendamento.status = "rejeitado"
        agendamento.save(update_fields=["status"])
        return

    # Se todos aprovados
    if not documentos.filter(
        status=DocumentoAgendamento.Status.PENDENTE
    ).exists():
        agendamento.status = "aprovado"
        agendamento.save(update_fields=["status"])
        return

    # Caso contrário
    agendamento.status = "pendente"
    agendamento.save(update_fields=["status"])
