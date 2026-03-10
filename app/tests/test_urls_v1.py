import pytest
from django.urls import reverse, resolve
from rest_framework.test import APIClient


@pytest.mark.django_db
class TestApiV1Urls:
    def setup_method(self):
        self.client = APIClient()

    def test_agendamentos_url_exists(self):
        url = "/api/v1/agendamentos/"
        response = self.client.get(url)
        assert response.status_code != 404

    def test_cartorios_url_exists(self):
        url = "/api/v1/cartorios/"
        response = self.client.get(url)
        assert response.status_code != 404

    def test_municipios_url_exists(self):
        url = "/api/v1/municipios/"
        response = self.client.get(url)
        assert response.status_code != 404

    def test_dashboard_url_exists(self):
        url = "/api/v1/dashboard/"
        response = self.client.get(url)
        assert response.status_code != 404

    def test_documentos_nested_url_exists(self):
        # Não importa se retorna 400/403, só não pode ser 404
        url = "/api/v1/agendamentos/1/documentos/"
        response = self.client.get(url)
        assert response.status_code != 404
