from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError

from app.models import (
    DocumentoAgendamento,
    DocumentoAgendamentoValidacaoHistorico,
    Auditoria,
)
from app.services.auditoria_service import AuditoriaService


def reenviar_documento(*, documento: DocumentoAgendamento, novo_arquivo, usuario) -> DocumentoAgendamento:
    """
    Reenvio de documento:
    - cria um novo DocumentoAgendamento (pendente) com mesmo nome/categoria/agendamento
    - registra histórico
    - marca o documento antigo como pendente e limpa validação (opcional, mas mantém coerência)
    - registra auditoria
    """
    if not novo_arquivo:
        raise ValidationError("Arquivo é obrigatório para reenvio.")

    with transaction.atomic():
        doc_antigo = DocumentoAgendamento.objects.select_for_update().get(pk=documento.pk)

        agendamento = doc_antigo.agendamento

        # "Reabrir" documento anterior (mantém coerência caso já estivesse aprovado/reprovado)
        doc_antigo.status = DocumentoAgendamento.Status.PENDENTE
        doc_antigo.observacao_validacao = None
        doc_antigo.validado_por = None
        doc_antigo.validado_em = None
        doc_antigo.sla_estourado = False
        doc_antigo.save()

        # cria novo documento pendente
        doc_novo = DocumentoAgendamento.objects.create(
            agendamento=agendamento,
            nome=doc_antigo.nome,
            categoria=doc_antigo.categoria,
            arquivo=novo_arquivo,
            status=DocumentoAgendamento.Status.PENDENTE,
            prazo_validacao_em=timezone.now() + timezone.timedelta(hours=48),
        )

        DocumentoAgendamentoValidacaoHistorico.objects.create(
            documento=doc_novo,
            status_anterior=doc_antigo.status,
            status_novo=doc_novo.status,
            observacao="Reenvio de documento",
            validado_por=usuario,
        )

        # se existir no seu domínio, atualiza status do agendamento
        if hasattr(agendamento, "atualizar_status_por_documentos"):
            agendamento.atualizar_status_por_documentos()
            agendamento.save()

        AuditoriaService.registrar_evento(
            tipo_evento=Auditoria.TipoEvento.REENVIO_DOCUMENTO,
            usuario_executor=usuario,
            usuario_afetado=agendamento.cliente,
            descricao=f"Documento #{doc_antigo.pk} reenviado (novo doc #{doc_novo.pk}).",
            metadata={
                "documento_antigo_id": doc_antigo.pk,
                "documento_novo_id": doc_novo.pk,
                "agendamento_id": agendamento.pk,
            },
        )

        return doc_novo
