import pytest
from unittest.mock import patch

from django.utils import timezone
from django.core.files.uploadedfile import SimpleUploadedFile

from usuarios.models import User
from app.models import Agendamento, DocumentoAgendamento, CategoriaDocumento
from app.services.agendamento.documento_reenvio_service import reenviar_documento


@pytest.mark.django_db
class TestDocumentoReenvioService:
    def criar_usuario(self, role="admin"):
        return User.objects.create_user(
            username=f"user_{role}",
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

    def criar_documento(self, agendamento):
        categoria = CategoriaDocumento.objects.create(nome="Cat 1")
        arquivo = SimpleUploadedFile("doc1.pdf", b"conteudo", content_type="application/pdf")
        return DocumentoAgendamento.objects.create(
            agendamento=agendamento,
            nome="RG",
            categoria=categoria,
            arquivo=arquivo,
            status=DocumentoAgendamento.Status.PENDENTE,
        )

    def test_reenvio_sem_arquivo_erro(self):
        usuario = self.criar_usuario("admin")
        cliente = self.criar_usuario("cliente")
        ag = self.criar_agendamento(cliente)
        doc = self.criar_documento(ag)

        with pytest.raises(Exception):
            reenviar_documento(documento=doc, novo_arquivo=None, usuario=usuario)

    @patch("app.services.agendamento.documento_reenvio_service.AuditoriaService.registrar_evento")
    def test_reenvio_cria_novo_documento(self, mock_auditoria):
        usuario = self.criar_usuario("admin")
        cliente = self.criar_usuario("cliente")
        ag = self.criar_agendamento(cliente)
        doc = self.criar_documento(ag)

        novo_arquivo = SimpleUploadedFile("doc2.pdf", b"novo", content_type="application/pdf")

        doc_novo = reenviar_documento(documento=doc, novo_arquivo=novo_arquivo, usuario=usuario)

        assert doc_novo.pk is not None
        assert doc_novo.agendamento_id == ag.id
        assert doc_novo.nome == doc.nome
        assert doc_novo.categoria_id == doc.categoria_id
        assert doc_novo.status == DocumentoAgendamento.Status.PENDENTE

        mock_auditoria.assert_called_once()
