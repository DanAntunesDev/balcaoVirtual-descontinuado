import pytest
from app.services.dashboard.dashboard_service import dashboard_por_usuario


@pytest.mark.django_db
def test_dashboard_superadmin(usuario_superadmin):
    data = dashboard_por_usuario(usuario_superadmin)

    assert "total_agendamentos" in data
    assert "total_documentos" in data
    assert "documentos_por_status" in data


@pytest.mark.django_db
def test_dashboard_cliente(usuario_cliente):
    data = dashboard_por_usuario(usuario_cliente)

    assert isinstance(data["total_agendamentos"], int)
    assert isinstance(data["total_documentos"], int)


@pytest.mark.django_db
def test_dashboard_profissional(usuario_profissional):
    data = dashboard_por_usuario(usuario_profissional)

    assert "agendamentos_por_status" in data
