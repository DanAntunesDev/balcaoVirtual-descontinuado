from __future__ import annotations

from typing import Any

from .policy_engine import cargo_pode as _cargo_pode


def cargo_pode(usuario: Any, permissao: str) -> bool:
    """
    Mantido porque o projeto já importa isso (ex.: app/models.py).
    Agora delega para o PolicyEngine central.
    """
    return _cargo_pode(usuario, permissao)
