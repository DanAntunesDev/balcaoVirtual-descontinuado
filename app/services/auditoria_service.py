from typing import Any, Dict, Optional
from app.models import Auditoria


def registrar_auditoria(
    *,
    # NOVA API
    tipo_evento: Optional[str] = None,
    usuario_executor: Any = None,
    usuario_afetado: Any = None,
    # API LEGADA (usada nos testes)
    usuario: Any = None,
    acao: Optional[str] = None,
    descricao: str = "",
    metadata: Optional[Dict] = None,
) -> Auditoria:
    """
    Função compatível com API nova e antiga.
    """

    # Compatibilidade com testes antigos
    if usuario is not None:
        usuario_executor = usuario

    if acao is not None:
        tipo_evento = acao

    return Auditoria.objects.create(
        tipo_evento=tipo_evento,
        usuario_executor=usuario_executor,
        usuario_afetado=usuario_afetado,
        descricao=descricao,
        metadata=metadata or {},
    )


class AuditoriaService:
    """Service de Auditoria (domínio)."""

    @staticmethod
    def registrar_evento(
        *,
        tipo_evento: Optional[str] = None,
        usuario_executor: Any = None,
        usuario_afetado: Any = None,
        # Compat testes
        usuario: Any = None,
        acao: Optional[str] = None,
        descricao: str = "",
        metadata: Optional[Dict] = None,
    ) -> Auditoria:

        if usuario is not None:
            usuario_executor = usuario

        if acao is not None:
            tipo_evento = acao

        return registrar_auditoria(
            tipo_evento=tipo_evento,
            usuario_executor=usuario_executor,
            usuario_afetado=usuario_afetado,
            descricao=descricao,
            metadata=metadata,
        )
