from __future__ import annotations

from .base import (
    IsSuperAdmin,
    IsAdmin,
    IsAdminOrSuperAdmin,
    IsAuthenticatedAndActive,
    IsActiveUser,
    CanBase,
)


class Can(CanBase):
    """
    Wrapper semântico (melhor leitura): Can("usuario:criar")
    """
    pass