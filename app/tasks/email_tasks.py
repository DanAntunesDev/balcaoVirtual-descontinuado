from celery import shared_task

from app.models import Agendamento
from app.services.email_service import (
    enviar_email_agendamento,
    enviar_email_boas_vindas,
    enviar_email_codigo_recuperacao,
    enviar_email_senha_alterada,
    enviar_email_agendamento_criado,
    enviar_email_agendamento_confirmado,
    enviar_email_lembrete_agendamento,
    notificar_documento_reprovado,
    notificar_sla_estourado,
    notificar_usuario,
)


@shared_task(bind=True, max_retries=3)
def enviar_email_agendamento_criado_task(self, agendamento_id: int):
    try:
        agendamento = Agendamento.objects.select_related("cliente", "cartorio").get(pk=agendamento_id)
    except Agendamento.DoesNotExist:
        return
    enviar_email_agendamento_criado(agendamento)


@shared_task(bind=True, max_retries=3)
def enviar_email_agendamento_confirmado_task(self, agendamento_id: int):
    try:
        agendamento = Agendamento.objects.select_related("cliente", "cartorio").get(pk=agendamento_id)
    except Agendamento.DoesNotExist:
        return
    enviar_email_agendamento_confirmado(agendamento)


@shared_task(bind=True, max_retries=3)
def enviar_email_agendamento_lembrete_task(
    self,
    agendamento_id: int,
    scheduled_for_iso: str | None = None,
):
    try:
        agendamento = Agendamento.objects.select_related("cliente", "cartorio").get(pk=agendamento_id)
    except Agendamento.DoesNotExist:
        return
    enviar_email_lembrete_agendamento(agendamento)