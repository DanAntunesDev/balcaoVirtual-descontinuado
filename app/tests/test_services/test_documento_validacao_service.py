import pytest
from unittest.mock import patch
from django.utils import timezone
from django.core.exceptions import ValidationError

from usuarios.models import User
from app.models import (
    Agendamento,
    DocumentoAgendamento,
    DocumentoAgendamentoValidacaoHistorico,
    CategoriaDocumento,
)
from app.services.agendamento.documento_validacao_service import validar_documento


@pytest.mark.django_db
class TestDocumentoValidacaoService:

    # =====================================================
    # HELPERS
    # =====================================================

    def criar_usuario(self, role="admin"):
        return User.objects.create_user(
            username=f"user_{role}_{timezone.now().timestamp()}",
            email=f"user_{role}_{timezone.now().timestamp()}@test.com",
            password="123",
            role=role,
        )

    def criar_agendamento(self, cliente):
        return Agendamento.objects.create(
            cliente=cliente,
            data_hora=timezone.now(),
            status=Agendamento.Status.PENDENTE,
        )

    def criar_documento(self, agendamento):
        categoria = CategoriaDocumento.objects.create(
            nome="Categoria Teste"
        )

        return DocumentoAgendamento.objects.create(
            agendamento=agendamento,
            nome="Documento Teste",
            categoria=categoria,
            arquivo="arquivo.pdf",
            status=DocumentoAgendamento.Status.PENDENTE,
            prazo_validacao_em=timezone.now() + timezone.timedelta(days=2),
        )

    # =====================================================
    # PERMISSÃO
    # =====================================================

    @patch("app.services.agendamento.documento_validacao_service.cargo_pode", return_value=False)
    def test_profissional_sem_permissao_nao_valida(self, mock_cargo):
        usuario = self.criar_usuario("profissional")
        cliente = self.criar_usuario("cliente")
        ag = self.criar_agendamento(cliente)
        doc = self.criar_documento(ag)

        with pytest.raises(ValidationError):
            validar_documento(
                documento=doc,
                status=DocumentoAgendamento.Status.APROVADO,
                observacao_validacao="ok",
                usuario=usuario,
            )

    # =====================================================
    # REGRAS DE BLOQUEIO
    # =====================================================

    def test_documento_ja_validado_nao_pode_validar_novamente(self):
        usuario = self.criar_usuario("admin")
        cliente = self.criar_usuario("cliente")
        ag = self.criar_agendamento(cliente)

        doc = self.criar_documento(ag)
        doc.validado_em = timezone.now()
        doc.save()

        with pytest.raises(ValidationError):
            validar_documento(
                documento=doc,
                status=DocumentoAgendamento.Status.APROVADO,
                observacao_validacao="ok",
                usuario=usuario,
            )

    def test_reprovar_sem_observacao_gera_erro(self):
        usuario = self.criar_usuario("admin")
        cliente = self.criar_usuario("cliente")
        ag = self.criar_agendamento(cliente)
        doc = self.criar_documento(ag)

        with pytest.raises(ValidationError):
            validar_documento(
                documento=doc,
                status=DocumentoAgendamento.Status.REPROVADO,
                observacao_validacao="",
                usuario=usuario,
            )

    # =====================================================
    # FLUXO NORMAL
    # =====================================================

    @patch("app.services.agendamento.documento_validacao_service.notificar_sla_estourado")
    @patch("app.services.agendamento.documento_validacao_service.notificar_documento_reprovado")
    @patch("app.services.agendamento.documento_validacao_service.AuditoriaService.registrar_evento")
    def test_validacao_sucesso(
        self,
        mock_auditoria,
        mock_notif_reprovado,
        mock_notif_sla,
    ):
        usuario = self.criar_usuario("admin")
        cliente = self.criar_usuario("cliente")
        ag = self.criar_agendamento(cliente)
        doc = self.criar_documento(ag)

        validar_documento(
            documento=doc,
            status=DocumentoAgendamento.Status.APROVADO,
            observacao_validacao="Tudo certo",
            usuario=usuario,
        )

        doc.refresh_from_db()

        assert doc.status == DocumentoAgendamento.Status.APROVADO
        assert doc.validado_por == usuario
        assert doc.validado_em is not None
        assert DocumentoAgendamentoValidacaoHistorico.objects.count() == 1

        mock_auditoria.assert_called_once()
        mock_notif_reprovado.assert_not_called()
        mock_notif_sla.assert_called_once()

    # =====================================================
    # SLA ESTOURADO
    # =====================================================

    @patch("app.services.agendamento.documento_validacao_service.notificar_sla_estourado")
    @patch("app.services.agendamento.documento_validacao_service.AuditoriaService.registrar_evento")
    def test_sla_estourado_marcado(
        self,
        mock_auditoria,
        mock_notif_sla,
    ):
        usuario = self.criar_usuario("admin")
        cliente = self.criar_usuario("cliente")
        ag = self.criar_agendamento(cliente)

        doc = self.criar_documento(ag)
        doc.prazo_validacao_em = timezone.now() - timezone.timedelta(days=1)
        doc.save()

        validar_documento(
            documento=doc,
            status=DocumentoAgendamento.Status.APROVADO,
            observacao_validacao="ok",
            usuario=usuario,
        )

        doc.refresh_from_db()
        assert doc.sla_estourado is True
