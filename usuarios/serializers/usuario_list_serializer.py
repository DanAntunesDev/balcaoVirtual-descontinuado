from rest_framework import serializers
from usuarios.models.usuario import User


def _safe_get(obj, attr, default=None):
    return getattr(obj, attr, default)


class UsuarioListSerializer(serializers.ModelSerializer):
    """
    Serializer de listagem (GET /usuarios/).
    Mantém o contrato do front e NÃO explode se campos opcionais não existirem no model.
    """

    cpf = serializers.SerializerMethodField()
    telefone = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    created_at = serializers.SerializerMethodField()
    modified_at = serializers.SerializerMethodField()

    cartorio_id = serializers.SerializerMethodField()
    cartorio_nome = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "cpf",
            "telefone",
            "role",
            "status",
            "is_active",
            "cartorio_id",
            "cartorio_nome",
            "cargo_judicial",
            "created_at",
            "modified_at",
        ]
        read_only_fields = fields

    def get_cpf(self, obj):
        return _safe_get(obj, "cpf")

    def get_telefone(self, obj):
        return _safe_get(obj, "telefone")

    def get_status(self, obj):
        # Se existir um campo real "status" no model e estiver preenchido, usa ele
        value = getattr(obj, "status", None)
        if value not in (None, ""):
            return value
        # fallback para is_active
        return "ativo" if getattr(obj, "is_active", True) else "inativo"

    def get_created_at(self, obj):
        return _safe_get(obj, "created_at", _safe_get(obj, "date_joined"))

    def get_modified_at(self, obj):
        return _safe_get(obj, "modified_at")

    def get_cartorio_id(self, obj):
        # usa o campo real do banco (FK) — confiável
        return getattr(obj, "cartorio_id", None)

    def get_cartorio_nome(self, obj):
        # se não tiver cartório, retorna None
        if not getattr(obj, "cartorio_id", None):
            return None
        cartorio = getattr(obj, "cartorio", None)
        return getattr(cartorio, "nome", None)
