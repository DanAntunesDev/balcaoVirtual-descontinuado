import pytest
from types import SimpleNamespace
from unittest.mock import patch

from app.permissions.documento_reenvio_permission import PodeReenviarDocumento


@pytest.fixture
def permission():
    return PodeReenviarDocumento()


def make_user(role="cliente", user_id=1, authenticated=True):
    return SimpleNamespace(
        id=user_id,
        role=role,
        is_authenticated=authenticated,
    )


def make_documento(cliente_id=1):
    agendamento = SimpleNamespace(cliente_id=cliente_id)
    return SimpleNamespace(agendamento=agendamento)


def make_view(documento=None):
    return SimpleNamespace(documento=documento)


def test_nao_autenticado(permission):
    request = SimpleNamespace(user=None)
    view = make_view()
    assert permission.has_permission(request, view) is False


def test_sem_documento(permission):
    user = make_user()
    request = SimpleNamespace(user=user)
    view = make_view(documento=None)
    assert permission.has_permission(request, view) is False


def test_superadmin_pode(permission):
    user = make_user(role="superadmin")
    documento = make_documento()
    request = SimpleNamespace(user=user)
    view = make_view(documento)
    assert permission.has_permission(request, view) is True


def test_admin_pode(permission):
    user = make_user(role="admin")
    documento = make_documento()
    request = SimpleNamespace(user=user)
    view = make_view(documento)
    assert permission.has_permission(request, view) is True


def test_cartorio_pode(permission):
    user = make_user(role="cartorio")
    documento = make_documento()
    request = SimpleNamespace(user=user)
    view = make_view(documento)
    assert permission.has_permission(request, view) is True


@patch("app.permissions.documento_reenvio_permission.cargo_pode")
def test_profissional_com_permissao(mock_cargo, permission):
    mock_cargo.return_value = True
    user = make_user(role="profissional")
    documento = make_documento()
    request = SimpleNamespace(user=user)
    view = make_view(documento)

    assert permission.has_permission(request, view) is True
    mock_cargo.assert_called_once_with(user, "reenviar_documento")


@patch("app.permissions.documento_reenvio_permission.cargo_pode")
def test_profissional_sem_permissao(mock_cargo, permission):
    mock_cargo.return_value = False
    user = make_user(role="profissional")
    documento = make_documento()
    request = SimpleNamespace(user=user)
    view = make_view(documento)

    assert permission.has_permission(request, view) is False


def test_cliente_dono(permission):
    user = make_user(role="cliente", user_id=1)
    documento = make_documento(cliente_id=1)
    request = SimpleNamespace(user=user)
    view = make_view(documento)

    assert permission.has_permission(request, view) is True


def test_cliente_nao_dono(permission):
    user = make_user(role="cliente", user_id=2)
    documento = make_documento(cliente_id=1)
    request = SimpleNamespace(user=user)
    view = make_view(documento)

    assert permission.has_permission(request, view) is False
