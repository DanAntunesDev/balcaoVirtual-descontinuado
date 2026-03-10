import pytest
from types import SimpleNamespace
from unittest.mock import Mock, patch

from app.permissions.agendamento_permission import (
    PodeCriarAgendamento,
    PodeEditarAgendamento,
    PodeVerAgendamento,
)
def make_user(role="cliente", authenticated=True, user_id=1):
    return SimpleNamespace(
        role=role,
        is_authenticated=authenticated,
        id=user_id,
    )


def make_request(user):
    return SimpleNamespace(user=user)
@pytest.mark.parametrize(
    "role,expected",
    [
        ("cliente", True),
        ("superadmin", True),
        ("admin", True),
        ("cartorio", True),
        ("profissional", True),
        ("qualquer_outro", False),
    ],
)
def test_pode_criar_agendamento(role, expected):
    user = make_user(role=role)
    request = make_request(user)
    permission = PodeCriarAgendamento()

    assert permission.has_permission(request, None) is expected


def test_pode_criar_agendamento_nao_autenticado():
    user = make_user(authenticated=False)
    request = make_request(user)
    permission = PodeCriarAgendamento()

    assert permission.has_permission(request, None) is False
@pytest.mark.parametrize(
    "role",
    ["superadmin", "admin", "cartorio"],
)
def test_pode_editar_agendamento_roles_liberados(role):
    user = make_user(role=role)
    request = make_request(user)
    permission = PodeEditarAgendamento()

    assert permission.has_permission(request, None) is True
@patch("app.permissions.agendamento_permission.cargo_pode")
def test_profissional_pode_editar(mock_cargo):
    mock_cargo.return_value = True

    user = make_user(role="profissional")
    request = make_request(user)
    permission = PodeEditarAgendamento()

    assert permission.has_permission(request, None) is True
    mock_cargo.assert_called_once_with(user, "editar_agendamento")
@patch("app.permissions.agendamento_permission.cargo_pode")
def test_profissional_nao_pode_editar(mock_cargo):
    mock_cargo.return_value = False

    user = make_user(role="profissional")
    request = make_request(user)
    permission = PodeEditarAgendamento()

    assert permission.has_permission(request, None) is False
def test_cliente_nao_pode_editar():
    user = make_user(role="cliente")
    request = make_request(user)
    permission = PodeEditarAgendamento()

    assert permission.has_permission(request, None) is False
@pytest.mark.parametrize(
    "role",
    ["superadmin", "admin", "cartorio"],
)
def test_admins_podem_ver(role):
    user = make_user(role=role)
    request = make_request(user)
    permission = PodeVerAgendamento()

    view = Mock()

    assert permission.has_permission(request, view) is True
def test_cliente_pode_ver_se_for_dono():
    user = make_user(role="cliente", user_id=10)
    request = make_request(user)

    agendamento = SimpleNamespace(cliente_id=10)
    view = Mock()
    view.get_object.return_value = agendamento

    permission = PodeVerAgendamento()

    assert permission.has_permission(request, view) is True
def test_cliente_nao_pode_ver_se_nao_for_dono():
    user = make_user(role="cliente", user_id=10)
    request = make_request(user)

    agendamento = SimpleNamespace(cliente_id=99)
    view = Mock()
    view.get_object.return_value = agendamento

    permission = PodeVerAgendamento()

    assert permission.has_permission(request, view) is False
def test_profissional_pode_ver_se_for_responsavel():
    user = make_user(role="profissional", user_id=5)
    request = make_request(user)

    agendamento = SimpleNamespace(
        profissional_id=5,
        cliente_id=999,
    )

    view = Mock()
    view.get_object.return_value = agendamento

    permission = PodeVerAgendamento()

    assert permission.has_permission(request, view) is True
@patch("app.permissions.agendamento_permission.cargo_pode")
def test_profissional_pode_ver_por_cargo(mock_cargo):
    mock_cargo.side_effect = lambda user, action: action == "editar_agendamento"

    user = make_user(role="profissional", user_id=5)
    request = make_request(user)

    agendamento = SimpleNamespace(
        profissional_id=999,
        cliente_id=999,
    )

    view = Mock()
    view.get_object.return_value = agendamento

    permission = PodeVerAgendamento()

    assert permission.has_permission(request, view) is True
def test_pode_ver_quando_get_object_falha():
    user = make_user(role="cliente")
    request = make_request(user)

    view = Mock()
    view.get_object.side_effect = Exception("erro")

    permission = PodeVerAgendamento()

    assert permission.has_permission(request, view) is False

def test_pode_editar_agendamento_nao_autenticado():
    user = make_user(authenticated=False)
    request = make_request(user)
    permission = PodeEditarAgendamento()
    assert permission.has_permission(request, None) is False


def test_pode_ver_agendamento_nao_autenticado():
    user = make_user(authenticated=False)
    request = make_request(user)
    permission = PodeVerAgendamento()
    view = Mock()
    assert permission.has_permission(request, view) is False


def test_pode_ver_agendamento_role_desconhecida():
    user = make_user(role="qualquer", user_id=1)
    request = make_request(user)

    agendamento = SimpleNamespace(cliente_id=999, profissional_id=999)
    view = Mock()
    view.get_object.return_value = agendamento

    permission = PodeVerAgendamento()
    assert permission.has_permission(request, view) is False
