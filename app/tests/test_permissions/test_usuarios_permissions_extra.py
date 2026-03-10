import pytest
from rest_framework.test import APIRequestFactory

from usuarios.permissions.base import IsActiveUser
from usuarios.permissions.permissions import IsAdminOrSuperAdmin
from usuarios.models.usuario import User


factory = APIRequestFactory()


@pytest.mark.django_db
class TestIsActiveUser:

    def test_usuario_ativo(self):
        user = User.objects.create_user(
            email="ativo@test.com",
            password="123",
            is_active=True,
        )

        request = factory.get("/")
        request.user = user

        permission = IsActiveUser()
        assert permission.has_permission(request, None) is True

    def test_usuario_inativo(self):
        user = User.objects.create_user(
            email="inativo@test.com",
            password="123",
            is_active=False,
        )

        request = factory.get("/")
        request.user = user

        permission = IsActiveUser()
        assert permission.has_permission(request, None) is False


@pytest.mark.django_db
class TestIsAdminOrSuperAdmin:

    def test_superadmin(self):
        user = User.objects.create_user(
            email="super@test.com",
            password="123",
            role="superadmin",
        )

        request = factory.get("/")
        request.user = user

        permission = IsAdminOrSuperAdmin()
        assert permission.has_permission(request, None) is True

    def test_admin(self):
        user = User.objects.create_user(
            email="admin@test.com",
            password="123",
            role="admin",
        )

        request = factory.get("/")
        request.user = user

        permission = IsAdminOrSuperAdmin()
        assert permission.has_permission(request, None) is True

    def test_cliente_bloqueado(self):
        user = User.objects.create_user(
            email="cliente@test.com",
            password="123",
            role="cliente",
        )

        request = factory.get("/")
        request.user = user

        permission = IsAdminOrSuperAdmin()
        assert permission.has_permission(request, None) is False
