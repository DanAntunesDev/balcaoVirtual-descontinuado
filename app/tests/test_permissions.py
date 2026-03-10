import pytest
from usuarios.permissions.policy_engine import cargo_pode


class DummyUser:
    def __init__(self, role, cargo_judicial=None):
        self.role = role
        self.cargo_judicial = cargo_judicial


def test_superadmin_tem_tudo():
    user = DummyUser(role="superadmin")
    assert cargo_pode(user, "qualquer_permissao") is True


def test_admin_tem_tudo():
    user = DummyUser(role="admin")
    assert cargo_pode(user, "qualquer_permissao") is True


def test_profissional_sem_permissao():
    user = DummyUser(role="profissional", cargo_judicial="cargo_inexistente")
    assert cargo_pode(user, "admin") is False


def test_usuario_none():
    assert cargo_pode(None, "qualquer") is False
