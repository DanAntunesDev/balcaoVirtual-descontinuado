from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError

from app.models import (
    DocumentoAgendamento,
    DocumentoAgendamentoValidacaoHistorico,
    Auditoria,
)
from app.services.email_service import (
    notificar_documento_reprovado,
    notificar_sla_estourado,
)
from app.services.auditoria_service import AuditoriaService
from usuarios.permissions.cargo_rules import cargo_pode


def validar_documento(
    *,
    documento: DocumentoAgendamento,
    status: str,
    observacao_validacao: str,
    usuario,
) -> DocumentoAgendamento:
    """Validação de documento (domínio).

    - admin/superadmin/cartorio validam sempre
    - profissional depende de cargo_judicial
    """

    if usuario.role == "profissional" and not cargo_pode(usuario, "validar_documento"):
        raise ValidationError("Seu cargo não pode validar documentos.")

    with transaction.atomic():
        doc = (
            DocumentoAgendamento.objects.select_for_update()
            .get(pk=documento.pk)
        )

        if doc.validado_em is not None:
            raise ValidationError("Este documento já foi validado e não pode ser alterado.")

        if status == DocumentoAgendamento.Status.REPROVADO and not observacao_validacao:
            raise ValidationError("Observação é obrigatória quando o documento é reprovado.")

        status_anterior = doc.status

        doc.status = status
        doc.observacao_validacao = observacao_validacao
        doc.validado_por = usuario
        doc.validado_em = timezone.now()

        if doc.prazo_validacao_em and timezone.now() > doc.prazo_validacao_em:
            doc.sla_estourado = True

        doc.save()

        DocumentoAgendamentoValidacaoHistorico.objects.create(
            documento=doc,
            status_anterior=status_anterior,
            status_novo=status,
            observacao=observacao_validacao,
            validado_por=usuario,
        )

        agendamento = doc.agendamento
        agendamento.atualizar_status_por_documentos()
        agendamento.save()

        AuditoriaService.registrar_evento(
            tipo_evento=Auditoria.TipoEvento.VALIDACAO_DOCUMENTO,
            usuario_executor=usuario,
            usuario_afetado=agendamento.cliente,
            descricao=f"Documento #{doc.pk} validado: {status_anterior} → {status}.",
            metadata={
                "documento_id": doc.pk,
                "agendamento_id": agendamento.pk,
                "status_anterior": status_anterior,
                "status_novo": status,
                "sla_estourado": bool(doc.sla_estourado),
            },
        )

    if status == DocumentoAgendamento.Status.REPROVADO:
        notificar_documento_reprovado(documento=doc)

    notificar_sla_estourado(documento=doc)
    return doc
