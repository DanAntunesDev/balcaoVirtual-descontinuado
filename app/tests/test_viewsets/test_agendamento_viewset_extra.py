import pytest
from datetime import datetime, timedelta
from django.utils import timezone
from rest_framework.test import APIClient
from django.urls import reverse

from app.models import Agendamento
from usuarios.models.usuario import User


@pytest.mark.django_db
class TestAgendamentoViewSetExtra:

    def setup_method(self):
        self.client = APIClient()

        self.superadmin = User.objects.create_user(
            email="super@teste.com",
            password="123",
            role="superadmin",
        )

        self.admin = User.objects.create_user(
            email="admin@teste.com",
            password="123",
            role="admin",
        )

        self.cliente = User.objects.create_user(
            email="cliente@teste.com",
            password="123",
            role="cliente",
        )

        self.profissional = User.objects.create_user(
            email="prof@teste.com",
            password="123",
            role="profissional",
        )

        self.data_futura = timezone.now() + timedelta(days=1)

        self.agendamento = Agendamento.objects.create(
            cliente=self.cliente,
            profissional=self.profissional,
            status="pendente",
            data_hora=self.data_futura,
        )

    # -----------------------------
    # LIST
    # -----------------------------

    def test_cliente_nao_pode_listar(self):
        self.client.force_authenticate(self.cliente)

        url = reverse("agendamento-list")
        response = self.client.get(url)

        assert response.status_code == 403

    def test_admin_pode_listar(self):
        self.client.force_authenticate(self.admin)

        url = reverse("agendamento-list")
        response = self.client.get(url)

        assert response.status_code in [200, 204]

    # -----------------------------
    # RETRIEVE
    # -----------------------------

    def test_cliente_so_ve_o_proprio(self):
        self.client.force_authenticate(self.cliente)

        url = reverse("agendamento-detail", args=[self.agendamento.id])
        response = self.client.get(url)

        assert response.status_code == 200

    def test_cliente_nao_ve_de_outro(self):
        outro_cliente = User.objects.create_user(
            email="outro@teste.com",
            password="123",
            role="cliente",
        )

        ag = Agendamento.objects.create(
            cliente=outro_cliente,
            profissional=self.profissional,
            status="pendente",
            data_hora=self.data_futura,
        )

        self.client.force_authenticate(self.cliente)

        url = reverse("agendamento-detail", args=[ag.id])
        response = self.client.get(url)

        assert response.status_code in [403, 404]

    # -----------------------------
    # UPDATE
    # -----------------------------

    def test_cliente_nao_pode_editar(self):
        self.client.force_authenticate(self.cliente)

        url = reverse("agendamento-detail", args=[self.agendamento.id])
        response = self.client.patch(url, {"status": "confirmado"})

        assert response.status_code == 403
