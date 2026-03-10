from rest_framework import serializers


class MeSerializer(serializers.Serializer):
    """
    Serializer exclusivo para o endpoint /me/.
    Centraliza o contrato que o frontend consome.
    """

    id = serializers.IntegerField()
    username = serializers.CharField()
    email = serializers.EmailField()
    role = serializers.CharField()
    is_active = serializers.BooleanField()
    tenant = serializers.IntegerField(allow_null=True)
    cartorio = serializers.IntegerField(allow_null=True)

    # NOVO (adição mínima): para exibir "Nome Sobrenome" no header e perfil
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    def to_representation(self, instance):
        return {
            "id": instance.id,
            "username": instance.username,
            "email": instance.email,
            "role": instance.role,
            "is_active": instance.is_active,
            "tenant": getattr(instance, "tenant_id", None),
            "cartorio": getattr(instance, "cartorio_id", None),

            # NOVO
            "first_name": getattr(instance, "first_name", "") or "",
            "last_name": getattr(instance, "last_name", "") or "",
        }