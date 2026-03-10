import pytest
from types import SimpleNamespace

from app.permissions.documento_upload_permission import PodeEnviarDocumento


class DummyStatus:
    CONFIRMADO = "confirmado"
    CANCELADO = "cancelado"
    PENDENTE = "pendente"


@pytest.fixture
def permission():
    return PodeEnviarDocumento()


def make_user(role="cliente", user_id=1, authenticated=True):
    return SimpleNamespace(
        id=user_id,
        role=role,
        is_authenticated=authenticated,
    )


def make_agendamento(cliente_id=1, status="pendente"):
    return SimpleNamespace(
        cliente_id=cliente_id,
        status=status,
        Status=DummyStatus,
    )


def make_view(agendamento=None):
    return SimpleNamespace(agendamento=agendamento)


def test_nao_autenticado(permission):
    request = SimpleNamespace(user=None)
    view = make_view()
    assert permission.has_permission(request, view) is False


def test_sem_agendamento(permission):
    user = make_user()
    request = SimpleNamespace(user=user)
    view = make_view(agendamento=None)
    assert permission.has_permission(request, view) is False


def test_cliente_nao_dono(permission):
    user = make_user(user_id=2)
    agendamento = make_agendamento(cliente_id=1)
    request = SimpleNamespace(user=user)
    view = make_view(agendamento)
    assert permission.has_permission(request, view) is False


def test_agendamento_confirmado(permission):
    user = make_user(user_id=1)
    agendamento = make_agendamento(
        cliente_id=1,
        status=DummyStatus.CONFIRMADO,
    )
    request = SimpleNamespace(user=user)
    view = make_view(agendamento)
    assert permission.has_permission(request, view) is False


def test_agendamento_cancelado(permission):
    user = make_user(user_id=1)
    agendamento = make_agendamento(
        cliente_id=1,
        status=DummyStatus.CANCELADO,
    )
    request = SimpleNamespace(user=user)
    view = make_view(agendamento)
    assert permission.has_permission(request, view) is False


def test_cliente_pode_enviar(permission):
    user = make_user(user_id=1)
    agendamento = make_agendamento(
        cliente_id=1,
        status=DummyStatus.PENDENTE,
    )
    request = SimpleNamespace(user=user)
    view = make_view(agendamento)
    assert permission.has_permission(request, view) is True
