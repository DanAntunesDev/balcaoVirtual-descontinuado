import pytest
from app.services.relatorios.relatorio_profissional_service import (
    relatorio_profissional,
)


@pytest.mark.django_db
def test_relatorio_profissional_basico(usuario_profissional):
    resultado = relatorio_profissional(usuario_profissional)

    assert "resumo" in resultado
    assert "documentos_por_status" in resultado

    assert "agendamentos" in resultado["resumo"]
    assert "documentos_pendentes" in resultado["resumo"]
    assert "documentos_reprovados" in resultado["resumo"]
    assert "sla_estourado" in resultado["resumo"]


@pytest.mark.django_db
def test_relatorio_profissional_com_periodo(usuario_profissional):
    resultado = relatorio_profissional(
        usuario_profissional,
        data_inicio="2024-01-01",
        data_fim="2025-01-01",
    )

    assert isinstance(resultado["resumo"]["agendamentos"], int)
    assert isinstance(resultado["documentos_por_status"], dict)
