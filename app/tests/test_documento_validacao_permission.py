import pytest
from types import SimpleNamespace
from unittest.mock import patch

from app.permissions.documento_validacao_permission import PodeValidarDocumento


@pytest.fixture
def permission():
    return PodeValidarDocumento()


def make_user(role="cliente", user_id=1, authenticated=True):
    return SimpleNamespace(
        id=user_id,
        role=role,
        is_authenticated=authenticated,
    )


def test_nao_autenticado(permission):
    request = SimpleNamespace(user=None)
    view = SimpleNamespace()
    assert permission.has_permission(request, view) is False


def test_cliente_nunca_pode(permission):
    user = make_user(role="cliente")
    request = SimpleNamespace(user=user)
    view = SimpleNamespace()
    assert permission.has_permission(request, view) is False


def test_superadmin_pode(permission):
    user = make_user(role="superadmin")
    request = SimpleNamespace(user=user)
    view = SimpleNamespace()
    assert permission.has_permission(request, view) is True


def test_admin_pode(permission):
    user = make_user(role="admin")
    request = SimpleNamespace(user=user)
    view = SimpleNamespace()
    assert permission.has_permission(request, view) is True


def test_cartorio_pode(permission):
    user = make_user(role="cartorio")
    request = SimpleNamespace(user=user)
    view = SimpleNamespace()
    assert permission.has_permission(request, view) is True


@patch("app.permissions.documento_validacao_permission.cargo_pode")
def test_profissional_com_permissao(mock_cargo, permission):
    mock_cargo.return_value = True
    user = make_user(role="profissional")
    request = SimpleNamespace(user=user)
    view = SimpleNamespace()

    assert permission.has_permission(request, view) is True
    mock_cargo.assert_called_once_with(user, "validar_documento")


@patch("app.permissions.documento_validacao_permission.cargo_pode")
def test_profissional_sem_permissao(mock_cargo, permission):
    mock_cargo.return_value = False
    user = make_user(role="profissional")
    request = SimpleNamespace(user=user)
    view = SimpleNamespace()

    assert permission.has_permission(request, view) is False
