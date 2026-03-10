import pytest
from rest_framework.test import APIClient
from django.urls import reverse

from app.models import Auditoria
from usuarios.models.usuario import User


@pytest.mark.django_db
class TestAuditoriaViewSetExtra:

    def setup_method(self):
        self.client = APIClient()

        self.superadmin = User.objects.create_user(
            email="super_aud@teste.com",
            password="123",
            role="superadmin",
        )

        self.admin = User.objects.create_user(
            email="admin_aud@teste.com",
            password="123",
            role="admin",
        )

        self.profissional = User.objects.create_user(
            email="prof_aud@teste.com",
            password="123",
            role="profissional",
        )

        self.cliente = User.objects.create_user(
            email="cliente_aud@teste.com",
            password="123",
            role="cliente",
        )

        self.auditoria = Auditoria.objects.create(
            tipo_evento="teste",
            usuario_executor=self.profissional,
            usuario_afetado=self.profissional,
        )

    # ---------------------------
    # LIST
    # ---------------------------

    def test_superadmin_pode_listar(self):
        self.client.force_authenticate(self.superadmin)
        response = self.client.get(reverse("auditoria-list"))
        assert response.status_code == 200

    def test_profissional_so_ve_envolvido(self):
        self.client.force_authenticate(self.profissional)
        response = self.client.get(reverse("auditoria-list"))
        assert response.status_code == 200
        assert len(response.data) >= 1

    def test_cliente_nao_ve(self):
        self.client.force_authenticate(self.cliente)
        response = self.client.get(reverse("auditoria-list"))
        assert response.status_code == 200
        assert response.data == []

    # ---------------------------
    # RETRIEVE (anti IDOR)
    # ---------------------------

    def test_cliente_nao_pode_retrieve(self):
        self.client.force_authenticate(self.cliente)
        response = self.client.get(
            reverse("auditoria-detail", args=[self.auditoria.id])
        )
        assert response.status_code in [403, 404]
