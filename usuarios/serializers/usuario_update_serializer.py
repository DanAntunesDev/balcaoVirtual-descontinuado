from rest_framework import serializers
from usuarios.models.usuario import User
from app.models import Cartorio

from usuarios.serializers.usuario_serializer import UsuarioSerializer


class UsuarioUpdateSerializer(serializers.ModelSerializer):
    """
    PATCH/PUT do usuário.

    - cartorio_id: FK real (vincula/desvincula com null)
    - status: alias de is_active ("ativo"/"inativo") para não quebrar front
    """

    cartorio_id = serializers.PrimaryKeyRelatedField(
        source="cartorio",
        queryset=Cartorio.objects.all(),
        allow_null=True,
        required=False,
    )

    # alias amigável pro front
    status = serializers.ChoiceField(
        choices=[("ativo", "ativo"), ("inativo", "inativo")],
        required=False,
        write_only=True,
    )

    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "email",
            "username",
            "role",
            "cargo_judicial",
            "cartorio_id",
            "is_active",
            "status",
            "password",
        ]

    def update(self, instance, validated_data):
        # status -> is_active (se vier)
        if "status" in validated_data:
            status = validated_data.pop("status")
            instance.is_active = (status == "ativo")

        # password (se vier)
        password = validated_data.pop("password", None)
        if password:
            instance.set_password(password)

        # cartorio (FK) vem em validated_data como "cartorio" por causa do source
        if "cartorio" in validated_data:
            instance.cartorio = validated_data.pop("cartorio")

        # demais campos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
