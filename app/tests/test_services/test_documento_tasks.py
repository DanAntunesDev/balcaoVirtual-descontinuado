import pytest
from unittest.mock import patch
from app.tasks.documento_tasks import enviar_email_documento_reprovado


@pytest.mark.django_db
@patch("app.tasks.documento_tasks.notificar_documento_reprovado")
def test_task_chama_service(mock_service, documento_reprovado):
    enviar_email_documento_reprovado(documento_reprovado.id)

    mock_service.assert_called_once()
