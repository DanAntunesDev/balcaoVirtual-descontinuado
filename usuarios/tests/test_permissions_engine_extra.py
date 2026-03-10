import pytest
from django.contrib.auth import get_user_model

from app.models import Cartorio
from usuarios.permissions.policy_engine import can
from usuarios.permissions.roles import Roles
from usuarios.permissions.scopes import Actions, Scopes


@pytest.mark.django_db
class TestPolicyEngineExtra:
    def test_superadmin_pode_tudo(self):
        User = get_user_model()
        u = User.objects.create_user(
            username="sa",
            email="sa@test.com",
            password="123456",
            role=Roles.SUPERADMIN,
        )
        assert can(u, Scopes.USUARIOS, Actions.LIST) is True
        assert can(u, Scopes.DOCUMENTOS, Actions.UPDATE) is True

    def test_admin_respeita_target_cartorio(self):
        User = get_user_model()
        u = User.objects.create_user(
            username="adm",
            email="adm@test.com",
            password="123456",
            role=Roles.ADMIN,
        )

        assert can(u, Scopes.USUARIOS, Actions.LIST, target_cartorio_id=1) is False

        cartorio = Cartorio.objects.create(nome="Cartório Admin")
        u.cartorio = cartorio
        u.save(update_fields=["cartorio"])

        assert can(u, Scopes.USUARIOS, Actions.LIST, target_cartorio_id=cartorio.id) is True
        assert can(u, Scopes.USUARIOS, Actions.LIST, target_cartorio_id=cartorio.id + 1) is False

    def test_cargo_matrix_fallback(self):
        User = get_user_model()
        u = User.objects.create_user(
            username="prof",
            email="prof@test.com",
            password="123456",
            role=Roles.PROFISSIONAL,
        )
        u.cargo_judicial = "servidor"
        u.save(update_fields=["cargo_judicial"])

        assert can(u, Scopes.DOCUMENTOS, Actions.LIST) is True
        assert can(u, Scopes.DOCUMENTOS, Actions.UPDATE) is True
        assert can(u, Scopes.AUDITORIA, Actions.LIST) is False