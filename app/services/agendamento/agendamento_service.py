from __future__ import annotations

from dataclasses import dataclass
from datetime import timedelta
from typing import Any

from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from app.models import Agendamento, Auditoria
from app.services.auditoria_service import AuditoriaService
from usuarios.permissions.cargo_rules import cargo_pode


@dataclass
class AgendamentoCreateData:
    cliente: Any
    profissional: Any | None
    cartorio: Any | None
    data_hora: Any
    observacoes: str | None = None


class AgendamentoService:
    def __init__(self, usuario):
        self.usuario = usuario

    def _assert_authenticated(self):
        if not self.usuario or not getattr(self.usuario, "is_authenticated", False):
            raise ValidationError("Usuário inválido.")

    def _assert_profissional_can(self, acao: str):
        role = getattr(self.usuario, "role", None)
        if role in ("superadmin", "admin"):
            return
        if role != "profissional":
            raise ValidationError("Somente profissional/admin/superadmin podem executar esta ação.")
        if not cargo_pode(self.usuario, acao):
            raise ValidationError("Este cargo não possui permissão para esta ação.")

    @transaction.atomic
    def create_agendamento(self, *, data: dict) -> Agendamento:
        self._assert_authenticated()

        payload = AgendamentoCreateData(
            cliente=data["cliente"],
            profissional=data.get("profissional"),
            cartorio=data.get("cartorio"),
            data_hora=data["data_hora"],
            observacoes=data.get("observacoes"),
        )

        ag = Agendamento(
            cliente=payload.cliente,
            profissional=payload.profissional,
            cartorio=payload.cartorio,
            data_hora=payload.data_hora,
            observacoes=payload.observacoes,
            criado_por=self.usuario,
        )
        ag.save()

        AuditoriaService.registrar_evento(
            tipo_evento=Auditoria.TipoEvento.CRIACAO_AGENDAMENTO,
            usuario_executor=self.usuario,
            usuario_afetado=payload.cliente,
            descricao=f"Agendamento criado (id={ag.pk}).",
            metadata={
                "agendamento_id": ag.pk,
                "cliente_id": getattr(payload.cliente, "id", None),
                "profissional_id": getattr(payload.profissional, "id", None) if payload.profissional else None,
                "cartorio_id": getattr(payload.cartorio, "id", None) if payload.cartorio else None,
                "data_hora": str(payload.data_hora),
            },
        )

        def _notify():
            try:
                from app.tasks.email_tasks import (
                    enviar_email_agendamento_criado_task,
                    enviar_email_agendamento_lembrete_task,
                )

                try:
                    enviar_email_agendamento_criado_task.delay(ag.pk)
                except Exception:
                    from app.services.email_service import enviar_email_agendamento_criado

                    enviar_email_agendamento_criado(ag)

                try:
                    eta = ag.data_hora - timedelta(hours=1)
                    if eta and eta > timezone.now():
                        enviar_email_agendamento_lembrete_task.apply_async(
                            args=(ag.pk, ag.data_hora.isoformat()),
                            eta=eta,
                        )
                except Exception:
                    pass

            except Exception:
                pass

        transaction.on_commit(_notify)

        return ag

    @transaction.atomic
    def update_agendamento(self, *, instance: Agendamento, data: dict) -> Agendamento:
        self._assert_authenticated()

        old_status = instance.status
        old_data_hora = instance.data_hora
        old_profissional_id = instance.profissional_id
        old_cartorio_id = instance.cartorio_id
        old_observacoes = instance.observacoes

        if "profissional" in data:
            instance.profissional = data.get("profissional")
        if "cartorio" in data:
            instance.cartorio = data.get("cartorio")
        if "data_hora" in data:
            instance.data_hora = data.get("data_hora")
        if "observacoes" in data:
            instance.observacoes = data.get("observacoes")
        if "status" in data:
            instance.status = data.get("status")

        if "status" in data:
            if instance.status == Agendamento.Status.CONFIRMADO:
                self._assert_profissional_can("confirmar_agendamento")
            if instance.status == Agendamento.Status.CANCELADO:
                self._assert_profissional_can("cancelar_agendamento")

        changed = any(
            [
                old_status != instance.status,
                str(old_data_hora) != str(instance.data_hora),
                old_profissional_id != instance.profissional_id,
                old_cartorio_id != instance.cartorio_id,
                (old_observacoes or "") != (instance.observacoes or ""),
            ]
        )

        if not changed:
            return instance

        instance.save()

        new_status = instance.status
        new_data_hora = instance.data_hora

        if old_status != new_status:
            if new_status == Agendamento.Status.CONFIRMADO:
                evento = Auditoria.TipoEvento.CONFIRMACAO_AGENDAMENTO
            elif new_status == Agendamento.Status.CANCELADO:
                evento = Auditoria.TipoEvento.CANCELAMENTO_AGENDAMENTO
            else:
                evento = Auditoria.TipoEvento.EDICAO_AGENDAMENTO
        else:
            evento = Auditoria.TipoEvento.EDICAO_AGENDAMENTO

        AuditoriaService.registrar_evento(
            tipo_evento=evento,
            usuario_executor=self.usuario,
            usuario_afetado=instance.cliente,
            descricao=f"Agendamento atualizado (id={instance.pk}).",
            metadata={
                "agendamento_id": instance.pk,
                "before": {
                    "status": old_status,
                    "data_hora": str(old_data_hora),
                    "profissional_id": old_profissional_id,
                    "cartorio_id": old_cartorio_id,
                    "observacoes": old_observacoes,
                },
                "after": {
                    "status": new_status,
                    "data_hora": str(new_data_hora),
                    "profissional_id": instance.profissional_id,
                    "cartorio_id": instance.cartorio_id,
                    "observacoes": instance.observacoes,
                },
            },
        )

        status_confirmado = old_status != new_status and new_status == Agendamento.Status.CONFIRMADO
        data_hora_changed = str(old_data_hora) != str(new_data_hora)

        def _notify():
            try:
                from app.tasks.email_tasks import (
                    enviar_email_agendamento_confirmado_task,
                    enviar_email_agendamento_lembrete_task,
                )

                if status_confirmado:
                    try:
                        enviar_email_agendamento_confirmado_task.delay(instance.pk)
                    except Exception:
                        from app.services.email_service import enviar_email_agendamento_confirmado

                        enviar_email_agendamento_confirmado(instance)

                if data_hora_changed and instance.status != Agendamento.Status.CANCELADO:
                    try:
                        eta = instance.data_hora - timedelta(hours=1)
                        if eta and eta > timezone.now():
                            enviar_email_agendamento_lembrete_task.apply_async(
                                args=(instance.pk, instance.data_hora.isoformat()),
                                eta=eta,
                            )
                    except Exception:
                        pass

            except Exception:
                pass

        transaction.on_commit(_notify)

        return instance

    @transaction.atomic
    def cancel_agendamento_cliente(self, *, instance: Agendamento) -> Agendamento:
        self._assert_authenticated()

        role = str(getattr(self.usuario, "role", "") or "").lower()
        if role != "cliente":
            raise ValidationError("Somente o cliente pode usar este fluxo de cancelamento.")

        if instance.cliente_id != getattr(self.usuario, "id", None):
            raise ValidationError("Você não pode cancelar um agendamento de outro cliente.")

        if instance.status == Agendamento.Status.CANCELADO:
            return instance

        status_anterior = instance.status
        instance.status = Agendamento.Status.CANCELADO
        instance.save()

        AuditoriaService.registrar_evento(
            tipo_evento=Auditoria.TipoEvento.CANCELAMENTO_AGENDAMENTO,
            usuario_executor=self.usuario,
            usuario_afetado=instance.cliente,
            descricao=f"Agendamento cancelado pelo cliente (id={instance.pk}).",
            metadata={
                "agendamento_id": instance.pk,
                "before": {"status": status_anterior},
                "after": {"status": instance.status},
            },
        )

        return instance