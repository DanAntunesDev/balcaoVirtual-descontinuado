import pytest
from unittest.mock import patch
from app.services.email_service import (
    notificar_documento_reprovado,
    notificar_sla_estourado
)


@pytest.mark.django_db
@patch("app.services.email_service.send_mail")
def test_notificar_documento_reprovado_envia_email(mock_send_mail, documento_reprovado):
    notificar_documento_reprovado(documento_reprovado)

    mock_send_mail.assert_called_once()


@pytest.mark.django_db
@patch("app.services.email_service.send_mail")
def test_notificar_documento_reprovado_sem_email_nao_envia(mock_send_mail, documento_reprovado):
    documento_reprovado.agendamento.cliente.email = ""
    documento_reprovado.agendamento.cliente.save()

    notificar_documento_reprovado(documento_reprovado)

    mock_send_mail.assert_not_called()


@pytest.mark.django_db
@patch("app.services.email_service.send_mail")
def test_notificar_sla_estourado_envia_email(mock_send_mail, documento_sla_estourado):
    notificar_sla_estourado(documento_sla_estourado)
    mock_send_mail.assert_called_once()


@pytest.mark.django_db
@patch("app.services.email_service.send_mail")
def test_notificar_sla_estourado_sem_flag_nao_envia(mock_send_mail, documento_reprovado):
    notificar_sla_estourado(documento_reprovado)
    mock_send_mail.assert_not_called()
