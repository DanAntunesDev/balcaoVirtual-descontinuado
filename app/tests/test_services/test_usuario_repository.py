import pytest
from usuarios.repositories.usuario_repository import UsuarioRepository


@pytest.mark.django_db
def test_filtrar_por_role(usuario_cliente):
    repo = UsuarioRepository()
    qs = repo.filtrar(role="cliente")

    assert qs.count() >= 1
