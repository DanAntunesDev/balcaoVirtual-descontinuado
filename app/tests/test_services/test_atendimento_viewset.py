import pytest
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_cliente_so_ve_seus_atendimentos(usuario_cliente, atendimento_cliente):
    client = APIClient()
    client.force_authenticate(usuario_cliente)

    response = client.get("/api/v1/atendimentos/")

    assert response.status_code == 200
