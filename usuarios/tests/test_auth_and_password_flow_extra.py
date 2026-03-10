import pytest
from django.contrib.auth import get_user_model
from django.core import mail
from rest_framework.test import APIClient

from usuarios.permissions.roles import Roles
from usuarios.models.password_reset import PasswordResetCode


@pytest.mark.django_db
class TestAuthAndPasswordFlowExtra:
    def setup_method(self):
        self.client = APIClient()

    def test_login_ok_retorna_tokens(self):
        User = get_user_model()
        User.objects.create_user(
            username="u",
            email="u@test.com",
            password="123456",
            role=Roles.CLIENTE,
        )

        resp = self.client.post("/api/usuarios/v1/login/", {"email": "u@test.com", "password": "123456"}, format="json")
        assert resp.status_code == 200
        assert "access" in resp.data
        assert "refresh" in resp.data
        assert "user" in resp.data

    def test_login_invalido(self):
        resp = self.client.post("/api/usuarios/v1/login/", {"email": "x@test.com", "password": "nope"}, format="json")
        assert resp.status_code == 400

    def test_password_request_cria_codigo_e_envia_email(self):
        User = get_user_model()
        u = User.objects.create_user("p", "p@test.com", "123456", role=Roles.CLIENTE)

        resp = self.client.post("/api/usuarios/v1/password/request/", {"email": u.email}, format="json")
        assert resp.status_code == 200

        # cria registro
        assert PasswordResetCode.objects.filter(user=u).exists()

        # envia email (backend de teste geralmente acumula em mail.outbox)
        assert len(mail.outbox) >= 1

    def test_password_reset_fluxo_completo(self):
        User = get_user_model()
        u = User.objects.create_user("r", "r@test.com", "123456", role=Roles.CLIENTE)

        # request
        self.client.post("/api/usuarios/v1/password/request/", {"email": u.email}, format="json")
        code_obj = PasswordResetCode.objects.filter(user=u).latest("created_at")

        # code-login
        resp = self.client.post("/api/usuarios/v1/password/code-login/", {"email": u.email, "code": code_obj.code}, format="json")
        assert resp.status_code == 200
        assert "access" in resp.data
        assert "refresh" in resp.data

        # reset
        resp = self.client.post(
            "/api/usuarios/v1/password/reset/",
            {"email": u.email, "code": code_obj.code, "new_password": "novaSenha123"},
            format="json",
        )
        assert resp.status_code == 200

        u.refresh_from_db()
        assert u.check_password("novaSenha123") is True
