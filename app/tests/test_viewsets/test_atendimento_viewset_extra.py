import pytest
from datetime import timedelta
from django.utils import timezone
from rest_framework.test import APIClient
from django.urls import reverse

from app.models import Atendimento, Agendamento
from usuarios.models.usuario import User


@pytest.mark.django_db
class TestAtendimentoViewSetExtra:

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

        self.atendimento = Atendimento.objects.create(
            agendamento=self.agendamento,
            profissional=self.profissional,
            usuario=self.cliente,
            cartorio=None,
        )

    # --------------------------
    # LIST
    # --------------------------

    def test_superadmin_pode_listar(self):
        self.client.force_authenticate(self.superadmin)
        response = self.client.get(reverse("atendimento-list"))
        assert response.status_code == 200

    def test_cliente_so_ve_o_proprio(self):
        self.client.force_authenticate(self.cliente)
        response = self.client.get(reverse("atendimento-detail", args=[self.atendimento.id]))
        assert response.status_code == 200

    def test_cliente_nao_ve_outro(self):
        outro_cliente = User.objects.create_user(
            email="outro@teste.com",
            password="123",
            role="cliente",
        )

        outro_ag = Agendamento.objects.create(
            cliente=outro_cliente,
            profissional=self.profissional,
            status="pendente",
            data_hora=self.data_futura,
        )

        outro_at = Atendimento.objects.create(
            agendamento=outro_ag,
            profissional=self.profissional,
            usuario=outro_cliente,
            cartorio=None,
        )

        self.client.force_authenticate(self.cliente)

        response = self.client.get(
            reverse("atendimento-detail", args=[outro_at.id])
        )

        assert response.status_code in [403, 404]
