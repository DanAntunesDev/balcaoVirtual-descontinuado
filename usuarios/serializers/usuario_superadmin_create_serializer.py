from rest_framework import serializers
from usuarios.models.usuario import User


class UsuarioSuperAdminCreateSerializer(serializers.ModelSerializer):
    """
    Criação via SuperAdmin.

    - NÃO exige senha
    - username pode vir de:
        - username (preferencial)
        - nome (alias legado)
        - email (fallback)
    - status ("ativo"/"inativo") vira is_active
    """

    # alias legado
    nome = serializers.CharField(required=False, write_only=True)

    # alias para status -> is_active
    status = serializers.ChoiceField(
        choices=[("ativo", "ativo"), ("inativo", "inativo")],
        required=False,
        write_only=True,
    )

    class Meta:
        model = User
        fields = [
            "nome",
            "username",
            "email",
            "role",
            "status",
            "is_active",
            "cartorio",
        ]

    def validate(self, attrs):
        # nome -> username
        nome = attrs.pop("nome", None)
        if nome and not attrs.get("username"):
            attrs["username"] = nome

        # fallback: se não veio username, usa email
        if not attrs.get("username") and attrs.get("email"):
            attrs["username"] = attrs["email"]

        return attrs

    def create(self, validated_data):
        # status -> is_active
        status = validated_data.pop("status", None)
        if status is not None:
            validated_data["is_active"] = (status == "ativo")

        user = User(**validated_data)
        user.set_unusable_password()
        user.save()
        return user
