import pytest
from app.services.historico_cliente_service import historico_cliente


@pytest.mark.django_db
def test_historico_cliente_retorna_agendamentos(usuario_cliente, agendamento_cliente):
    resultado = historico_cliente(usuario_cliente.id)

    assert isinstance(resultado, list)
    assert len(resultado) >= 1
