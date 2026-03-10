import pytest
from django.urls import resolve, reverse

from app.validators import somente_digitos, validar_cnpj


@pytest.mark.django_db
class TestAppValidatorsExtra:
    def test_somente_digitos_remove_tudo_que_nao_for_digito(self):
        assert somente_digitos("12.345/0001-90") == "12345000190"
        assert somente_digitos("abc") == ""
        assert somente_digitos("") == ""

    def test_validar_cnpj_invalido(self):
        # CNPJ com tamanho errado
        assert validar_cnpj("123") is False
        # CNPJ com todos iguais é inválido
        assert validar_cnpj("00.000.000/0000-00") is False

    def test_validar_cnpj_valido_exemplo_conhecido(self):
        # Exemplo comum em testes (válido)
        assert validar_cnpj("11.444.777/0001-61") is True


@pytest.mark.django_db
class TestAppUrlsExtra:
    def test_app_urls_include_v1(self):
        # garante que /api/v1/ existe e resolve algo conhecido (ping está em core)
        # aqui validamos que o include do app.urls não quebra.
        match = resolve("/api/v1/")
        # só garantir que não explode e que existe um resolver_match
        assert match is not None
