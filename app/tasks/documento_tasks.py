from celery import shared_task
from app.models import DocumentoAgendamento
from app.services.email_service import (
    notificar_documento_reprovado,
    notificar_sla_estourado,
)


@shared_task(bind=True, max_retries=3)
def enviar_email_documento_reprovado(self, documento_id):
    try:
        documento = DocumentoAgendamento.objects.get(id=documento_id)
        notificar_documento_reprovado(documento)
    except DocumentoAgendamento.DoesNotExist:
        return
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def enviar_email_sla_estourado(self, documento_id):
    try:
        documento = DocumentoAgendamento.objects.get(id=documento_id)
        notificar_sla_estourado(documento)
    except DocumentoAgendamento.DoesNotExist:
        return
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)
