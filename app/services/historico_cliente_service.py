from app.models import Agendamento, Atendimento, DocumentoAgendamento


def historico_cliente(cliente):
    """
    Retorna o histórico do cliente em dois formatos compatíveis com o
    estado atual do repositório.

    Contratos suportados:
    - historico_cliente(request.user) -> dict usado por HistoricoClienteSerializer
    - historico_cliente(cliente_id)   -> list usada por testes legados do service
    """

    cliente_id = getattr(cliente, "id", cliente)

    agendamentos = (
        Agendamento.objects
        .filter(cliente_id=cliente_id)
        .select_related("cartorio", "profissional", "cliente")
        .prefetch_related("documentos")
        .order_by("-criado_em")
    )

    atendimentos = (
        Atendimento.objects
        .filter(agendamento__cliente_id=cliente_id)
        .select_related("agendamento", "profissional", "usuario", "cartorio")
        .order_by("-criado_em")
    )

    documentos = (
        DocumentoAgendamento.objects
        .filter(agendamento__cliente_id=cliente_id)
        .select_related("agendamento", "categoria", "validado_por")
        .order_by("-criado_em")
    )

    if isinstance(cliente, int):
        return list(agendamentos)

    return {
        "agendamentos": agendamentos,
        "atendimentos": atendimentos,
        "documentos": documentos,
    }