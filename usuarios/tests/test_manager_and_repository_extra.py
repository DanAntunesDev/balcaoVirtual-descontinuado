import pytest
from django.contrib.auth import get_user_model

from app.models import Cartorio
from usuarios.permissions.roles import Roles
from usuarios.repositories.usuario_repository import UsuarioRepository


@pytest.mark.django_db
class TestUsuarioManagerExtra:
    def test_create_user_normaliza_email_e_seta_password(self):
        User = get_user_model()
        u = User.objects.create_user(
            username="u1",
            email="TEST@TEST.COM",
            password="123456",
            role=Roles.CLIENTE,
        )
        assert u.email == "test@test.com"
        assert u.check_password("123456") is True

    def test_create_superuser_seta_flags(self):
        User = get_user_model()
        su = User.objects.create_superuser(
            username="root",
            email="root@test.com",
            password="123456",
        )
        assert su.is_superuser is True
        assert su.is_staff is True


@pytest.mark.django_db
class TestUsuarioRepositoryExtra:
    def test_listar_por_cartorio(self):
        User = get_user_model()
        repo = UsuarioRepository()

        cartorio_a = Cartorio.objects.create(nome="Cartório A")
        cartorio_b = Cartorio.objects.create(nome="Cartório B")

        u1 = User.objects.create_user("a", "a@test.com", "123456", role=Roles.CLIENTE)
        u2 = User.objects.create_user("b", "b@test.com", "123456", role=Roles.CLIENTE)

        u1.cartorio = cartorio_a
        u2.cartorio = cartorio_b
        u1.save(update_fields=["cartorio"])
        u2.save(update_fields=["cartorio"])

        q1 = repo.listar_por_cartorio(cartorio_a.id)
        assert q1.count() == 1
        assert q1.first().id == u1.id

    def test_desativar_usuario(self):
        User = get_user_model()
        repo = UsuarioRepository()

        u = User.objects.create_user("x", "x@test.com", "123456", role=Roles.CLIENTE)
        assert u.is_active is True

        repo.desativar(u.id)

        u.refresh_from_db()
        assert u.is_active is False