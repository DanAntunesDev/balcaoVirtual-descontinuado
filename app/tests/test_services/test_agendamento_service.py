import pytest
from unittest.mock import patch, Mock

from django.core.exceptions import ValidationError
from django.utils import timezone

from app.models import Agendamento
from app.services.agendamento.agendamento_service import AgendamentoService
from usuarios.models import User


@pytest.mark.django_db
class TestAgendamentoService:

    # =============================
    # HELPERS
    # =============================

    def criar_usuario(self, role="cliente"):
        return User.objects.create_user(
            username=f"user_{role}_{timezone.now().timestamp()}",
            email=f"user_{role}@test.com",
            password="123",
            role=role,
        )

    def criar_agendamento(self, cliente):
        return Agendamento.objects.create(
            cliente=cliente,
            data_hora=timezone.now(),
            status=Agendamento.Status.PENDENTE,
        )

    # =============================
    # CREATE
    # =============================

    def test_create_agendamento_usuario_nao_autenticado(self):
        user = Mock()
        user.is_authenticated = False
        user.role = "cliente"

        service = AgendamentoService(user)

        with pytest.raises(ValidationError):
            service.create_agendamento(
                data={
                    "cliente": None,
                    "data_hora": timezone.now(),
                }
            )

    @patch("app.services.agendamento.agendamento_service.AuditoriaService.registrar_evento")
    def test_create_agendamento_sucesso(self, mock_auditoria):
        cliente = self.criar_usuario("cliente")
        admin = self.criar_usuario("admin")

        service = AgendamentoService(usuario=admin)

        ag = service.create_agendamento(
            data={
                "cliente": cliente,
                "data_hora": timezone.now(),
            }
        )

        assert ag.pk is not None
        assert ag.criado_por == admin
        mock_auditoria.assert_called_once()

    # =============================
    # UPDATE
    # =============================

    @patch("app.services.agendamento.agendamento_service.AuditoriaService.registrar_evento")
    def test_update_agendamento_edicao_simples(self, mock_auditoria):
        cliente = self.criar_usuario("cliente")
        admin = self.criar_usuario("admin")

        ag = self.criar_agendamento(cliente)

        service = AgendamentoService(usuario=admin)

        service.update_agendamento(
            instance=ag,
            data={"observacoes": "Nova observação"},
        )

        ag.refresh_from_db()
        assert ag.observacoes == "Nova observação"
        mock_auditoria.assert_called_once()

    @patch("app.services.agendamento.agendamento_service.cargo_pode", return_value=True)
    @patch("app.services.agendamento.agendamento_service.AuditoriaService.registrar_evento")
    def test_update_agendamento_confirmar_com_permissao(
        self, mock_auditoria, mock_cargo
    ):
        cliente = self.criar_usuario("cliente")
        profissional = self.criar_usuario("profissional")

        ag = self.criar_agendamento(cliente)

        service = AgendamentoService(usuario=profissional)

        service.update_agendamento(
            instance=ag,
            data={"status": Agendamento.Status.CONFIRMADO},
        )

        ag.refresh_from_db()
        assert ag.status == Agendamento.Status.CONFIRMADO
        mock_auditoria.assert_called_once()

    @patch("app.services.agendamento.agendamento_service.cargo_pode", return_value=False)
    def test_update_agendamento_confirmar_sem_permissao(self, mock_cargo):
        cliente = self.criar_usuario("cliente")
        profissional = self.criar_usuario("profissional")

        ag = self.criar_agendamento(cliente)

        service = AgendamentoService(usuario=profissional)

        with pytest.raises(ValidationError):
            service.update_agendamento(
                instance=ag,
                data={"status": Agendamento.Status.CONFIRMADO},
            )

    @patch("app.services.agendamento.agendamento_service.AuditoriaService.registrar_evento")
    def test_update_sem_mudanca_nao_registra_auditoria(self, mock_auditoria):
        cliente = self.criar_usuario("cliente")
        admin = self.criar_usuario("admin")

        ag = self.criar_agendamento(cliente)

        service = AgendamentoService(usuario=admin)

        service.update_agendamento(instance=ag, data={})

        mock_auditoria.assert_not_called()
