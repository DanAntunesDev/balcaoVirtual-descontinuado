from __future__ import annotations

from .roles import CargosJudiciais
from .scopes import Scopes as S
CARGO_PERMISSIONS: dict[str, set[str]] = {
    CargosJudiciais.JUIZ: {
        S.USUARIO_LISTAR,
        S.USUARIO_VER,
        S.AGENDAMENTO_GERIR,
        S.DOCUMENTO_VALIDAR,
        S.AUDITORIA_VER,
        S.RELATORIO_VER,
    },
    CargosJudiciais.SERVIDOR: {
        S.AGENDAMENTO_GERIR,
        S.DOCUMENTO_UPLOAD,
        S.DOCUMENTO_REENVIAR,
        S.USUARIO_VER,
    },
    CargosJudiciais.ADVOGADO: {
        S.AGENDAMENTO_GERIR,
        S.DOCUMENTO_UPLOAD,
        S.USUARIO_VER,
    },
    CargosJudiciais.ESTAGIARIO: {
        S.DOCUMENTO_UPLOAD,
        S.USUARIO_VER,
    },
}


def get_permissoes_por_cargo(cargo_judicial: str | None) -> set[str]:
    if not cargo_judicial:
        return set()
    return set(CARGO_PERMISSIONS.get(str(cargo_judicial), set()))


def get_permissions_for_cargo(cargo_judicial: str | None) -> set[str]:
    return get_permissoes_por_cargo(cargo_judicial)
