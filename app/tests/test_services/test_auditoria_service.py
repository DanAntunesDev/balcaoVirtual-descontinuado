import pytest
from app.models import Auditoria
from app.services.auditoria_service import registrar_auditoria, AuditoriaService


@pytest.mark.django_db
def test_registrar_auditoria_cria_registro(usuario_cliente):
    registrar_auditoria(
        usuario=usuario_cliente,
        acao="TESTE",
        descricao="Descricao teste"
    )

    assert Auditoria.objects.count() == 1
    auditoria = Auditoria.objects.first()

    assert auditoria.usuario == usuario_cliente
    assert auditoria.acao == "TESTE"
    assert auditoria.descricao == "Descricao teste"


@pytest.mark.django_db
def test_registrar_evento_service(usuario_cliente):
    AuditoriaService.registrar_evento(
        usuario=usuario_cliente,
        acao="EVENTO",
        descricao="Evento descricao"
    )

    assert Auditoria.objects.filter(acao="EVENTO").exists()
