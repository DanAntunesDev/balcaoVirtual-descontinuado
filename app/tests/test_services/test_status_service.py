import pytest
from app.services.agendamento.status_service import atualizar_status_agendamento
from app.models import DocumentoAgendamento


@pytest.mark.django_db
def test_status_reprovado_prioriza(documento_reprovado):
    agendamento = documento_reprovado.agendamento

    atualizar_status_agendamento(agendamento)

    agendamento.refresh_from_db()
    assert agendamento.status == "rejeitado"


@pytest.mark.django_db
def test_status_aprovado_quando_todos_aprovados(agendamento_com_documentos_aprovados):
    atualizar_status_agendamento(agendamento_com_documentos_aprovados)

    agendamento_com_documentos_aprovados.refresh_from_db()
    assert agendamento_com_documentos_aprovados.status == "aprovado"
