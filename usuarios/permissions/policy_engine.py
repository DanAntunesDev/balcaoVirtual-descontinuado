from .cargo_matrix import get_permissions_for_cargo
from .scopes import Scopes as S


def _normalize(value):
    if value is None:
        return None
    if hasattr(value, "value"):
        value = value.value
    return str(value).strip().lower()


def _permission_aliases(scope, action=None):
    scope = _normalize(scope)
    action = _normalize(action)

    candidates = set()
    if not scope:
        return candidates

    if not action:
        candidates.add(scope)
        return candidates

    candidates.add(f"{scope}:{action}")

    alias_map = {
        ("usuarios", "list"): {
            getattr(S, "USUARIO_LISTAR", None),
            getattr(S, "USUARIO_VER", None),
        },
        ("usuarios", "retrieve"): {
            getattr(S, "USUARIO_VER", None),
            getattr(S, "USUARIO_LISTAR", None),
        },
        ("usuarios", "view"): {
            getattr(S, "USUARIO_VER", None),
        },
        ("documentos", "list"): {
            getattr(S, "DOCUMENTO_UPLOAD", None),
            getattr(S, "DOCUMENTO_REENVIAR", None),
            getattr(S, "DOCUMENTO_VALIDAR", None),
        },
        ("documentos", "update"): {
            getattr(S, "DOCUMENTO_UPLOAD", None),
            getattr(S, "DOCUMENTO_REENVIAR", None),
            getattr(S, "DOCUMENTO_VALIDAR", None),
        },
        ("documentos", "create"): {
            getattr(S, "DOCUMENTO_UPLOAD", None),
        },
        ("documentos", "reupload"): {
            getattr(S, "DOCUMENTO_REENVIAR", None),
        },
        ("documentos", "validate"): {
            getattr(S, "DOCUMENTO_VALIDAR", None),
        },
        ("auditoria", "list"): {
            getattr(S, "AUDITORIA_VER", None),
        },
        ("relatorios", "list"): {
            getattr(S, "RELATORIO_VER", None),
        },
        ("agendamentos", "list"): {
            getattr(S, "AGENDAMENTO_GERIR", None),
        },
        ("agendamentos", "update"): {
            getattr(S, "AGENDAMENTO_GERIR", None),
        },
        ("agendamentos", "create"): {
            getattr(S, "AGENDAMENTO_GERIR", None),
        },
        ("agendamentos", "delete"): {
            getattr(S, "AGENDAMENTO_GERIR", None),
        },
    }

    candidates.update(filter(None, alias_map.get((scope, action), set())))
    return candidates


class PolicyEngine:
    @staticmethod
    def can(user, scope, action=None, target_cartorio_id=None):
        if not user:
            return False

        if hasattr(user, "is_active") and not user.is_active:
            return False

        role = getattr(user, "role", None)

        if role == "superadmin":
            return True

        if role == "admin":
            if not target_cartorio_id:
                return True
            return getattr(user, "cartorio_id", None) == target_cartorio_id

        cargo = getattr(user, "cargo_judicial", None)
        permissoes = get_permissions_for_cargo(cargo)

        if hasattr(scope, "value"):
            scope_value = scope.value
        else:
            scope_value = scope

        if action is None:
            return scope_value in permissoes

        candidates = _permission_aliases(scope, action)
        return bool(permissoes.intersection(candidates))


def cargo_pode(user, scope):
    return PolicyEngine.can(user, scope)


def can(user, scope, action=None, target_cartorio_id=None):
    return PolicyEngine.can(user, scope, action, target_cartorio_id)