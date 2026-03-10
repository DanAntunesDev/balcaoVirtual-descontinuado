from __future__ import annotations

from typing import Any, Dict, List, Optional

from django.contrib.auth import get_user_model
from django.db.models import Count, Model, QuerySet

User = get_user_model()

# --- Documento model tolerante ---
try:
    from app.models import DocumentoAgendamento as DocumentoModel  # type: ignore
except Exception:
    try:
        from app.models import Documento as DocumentoModel  # type: ignore
    except Exception:
        DocumentoModel = None  # type: ignore

from app.models import Agendamento, Atendimento  # type: ignore


# ===============================
# Helpers seguros
# ===============================

def _model_has_field(model: type[Model], field_name: str) -> bool:
    try:
        model._meta.get_field(field_name)
        return True
    except Exception:
        return False


def _status_breakdown(qs: QuerySet) -> Dict[str, Any]:
    total = qs.count()

    if total == 0:
        return {"total": 0, "por_status": []}

    if not _model_has_field(qs.model, "status"):
        return {"total": total, "por_status": []}

    rows = (
        qs.values("status")
        .annotate(total=Count("id"))
        .order_by("status")
    )

    return {
        "total": total,
        "por_status": [{"status": r["status"], "total": r["total"]} for r in rows],
    }


def _get_role(usuario: Any) -> str:
    return str(getattr(usuario, "role", "")).lower()


def _is_superadmin(usuario: Any) -> bool:
    if getattr(usuario, "is_superuser", False):
        return True
    return _get_role(usuario) in {"superadmin", "super_admin", "root"}


def _is_admin(usuario: Any) -> bool:
    if getattr(usuario, "is_staff", False) and not getattr(usuario, "is_superuser", False):
        return True
    return _get_role(usuario) in {"admin", "administrador"}


def _is_cartorio(usuario: Any) -> bool:
    return _get_role(usuario) == "cartorio"


def _is_profissional(usuario: Any) -> bool:
    return _get_role(usuario) in {"profissional", "profissional_judicial"}


def _is_juiz(usuario: Any) -> bool:
    return _get_role(usuario) == "juiz"


def _user_cartorio_ids(usuario: Any) -> List[int]:
    ids: List[int] = []

    if getattr(usuario, "cartorio_id", None):
        ids.append(int(usuario.cartorio_id))

    if hasattr(usuario, "cartorios_vinculados"):
        try:
            ids.extend(list(usuario.cartorios_vinculados.values_list("id", flat=True)))
        except Exception:
            pass

    if hasattr(usuario, "cartorios_criados"):
        try:
            ids.extend(list(usuario.cartorios_criados.values_list("id", flat=True)))
        except Exception:
            pass

    return sorted(set(ids))


def _apply_scope_cartorio(usuario: Any, ag_qs: QuerySet, at_qs: QuerySet, doc_qs: Optional[QuerySet]):
    ids = _user_cartorio_ids(usuario)

    if not ids:
        return ag_qs.none(), at_qs.none(), doc_qs.none() if doc_qs else None

    ag_qs = ag_qs.filter(cartorio_id__in=ids)
    at_qs = at_qs.filter(agendamento__cartorio_id__in=ids)

    if doc_qs is not None:
        doc_qs = doc_qs.filter(agendamento__cartorio_id__in=ids)

    return ag_qs, at_qs, doc_qs


def _apply_scope_profissional(usuario: Any, ag_qs: QuerySet, at_qs: QuerySet, doc_qs: Optional[QuerySet]):
    ag_qs = ag_qs.filter(profissional=usuario)
    at_qs = at_qs.filter(agendamento__profissional=usuario)

    if doc_qs is not None:
        doc_qs = doc_qs.filter(agendamento__profissional=usuario)

    return ag_qs, at_qs, doc_qs


def _apply_scope_cliente(usuario: Any, ag_qs: QuerySet, at_qs: QuerySet, doc_qs: Optional[QuerySet]):
    ag_qs = ag_qs.filter(cliente=usuario)
    at_qs = at_qs.filter(agendamento__cliente=usuario)

    if doc_qs is not None:
        doc_qs = doc_qs.filter(agendamento__cliente=usuario)

    return ag_qs, at_qs, doc_qs


def _apply_scope_juiz(usuario: Any, ag_qs: QuerySet, at_qs: QuerySet, doc_qs: Optional[QuerySet]):
    ag_qs = ag_qs.filter(profissional=usuario)
    at_qs = at_qs.filter(agendamento__profissional=usuario)

    if doc_qs is not None:
        doc_qs = doc_qs.filter(agendamento__profissional=usuario)

    return ag_qs, at_qs, doc_qs


def _cards_payload(ag_qs: QuerySet, at_qs: QuerySet, doc_qs: Optional[QuerySet]):
    return [
        {"id": "agendamentos", "label": "Agendamentos", "total": ag_qs.count()},
        {"id": "atendimentos", "label": "Atendimentos", "total": at_qs.count()},
        {
            "id": "documentos",
            "label": "Documentos",
            "total": doc_qs.count() if doc_qs else 0,
        },
    ]


# ===============================
# API pública
# ===============================

def dashboard_por_usuario(usuario: Any) -> Dict[str, Any]:

    ag_qs = Agendamento.objects.all()
    at_qs = Atendimento.objects.all()
    doc_qs = DocumentoModel.objects.all() if DocumentoModel else None

    if _is_superadmin(usuario):
        pass

    elif _is_admin(usuario) or _is_cartorio(usuario):
        ag_qs, at_qs, doc_qs = _apply_scope_cartorio(usuario, ag_qs, at_qs, doc_qs)

    elif _is_profissional(usuario):
        ag_qs, at_qs, doc_qs = _apply_scope_profissional(usuario, ag_qs, at_qs, doc_qs)

    elif _is_juiz(usuario):
        ag_qs, at_qs, doc_qs = _apply_scope_juiz(usuario, ag_qs, at_qs, doc_qs)

    elif _get_role(usuario) == "cliente":
        ag_qs, at_qs, doc_qs = _apply_scope_cliente(usuario, ag_qs, at_qs, doc_qs)

    else:
        ag_qs = ag_qs.none()
        at_qs = at_qs.none()
        doc_qs = doc_qs.none() if doc_qs else None

    ag_data = _status_breakdown(ag_qs)
    at_data = _status_breakdown(at_qs)
    doc_data = (
        _status_breakdown(doc_qs) if doc_qs else {"total": 0, "por_status": []}
    )

    response = {
        "cards": _cards_payload(ag_qs, at_qs, doc_qs),
        "agendamentos": ag_data,
        "atendimentos": at_data,
        "documentos": doc_data,
    }

    # Compatibilidade com testes antigos
    response["total_agendamentos"] = ag_data["total"]
    response["total_documentos"] = doc_data["total"]
    response["agendamentos_por_status"] = ag_data["por_status"]
    response["documentos_por_status"] = doc_data["por_status"]

    return response
