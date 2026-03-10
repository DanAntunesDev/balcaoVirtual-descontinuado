from rest_framework import serializers
from usuarios.models.usuario import User


def _safe_get(obj, attr, default=None):
    return getattr(obj, attr, default)


class UsuarioDetailSerializer(serializers.ModelSerializer):
    """
    Serializer de detalhe (GET /usuarios/{id}/) e /usuarios/v1/me/.
    """

    cpf = serializers.SerializerMethodField()
    telefone = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    cartorio = serializers.SerializerMethodField()

    notificar_email = serializers.SerializerMethodField()
    notificar_whatsapp = serializers.SerializerMethodField()
    lembrete_automatico_agendamento = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "cpf",
            "telefone",
            "role",
            "cargo_judicial",
            "cartorio",
            "status",
            "is_active",
            "is_staff",
            "is_superuser",
            "date_joined",
            "last_login",
            "notificar_email",
            "notificar_whatsapp",
            "lembrete_automatico_agendamento",
        ]
        read_only_fields = fields

    def get_cpf(self, obj):
        return _safe_get(obj, "cpf")

    def get_telefone(self, obj):
        return _safe_get(obj, "telefone")

    def get_status(self, obj):
        return "ativo" if obj.is_active else "inativo"

    def get_cartorio(self, obj):
        return getattr(obj, "cartorio_id", None)

    def get_notificar_email(self, obj):
        return bool(_safe_get(obj, "notificar_email", True))

    def get_notificar_whatsapp(self, obj):
        return bool(_safe_get(obj, "notificar_whatsapp", False))

    def get_lembrete_automatico_agendamento(self, obj):
        return bool(_safe_get(obj, "lembrete_automatico_agendamento", True))


class UsuarioCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    username = serializers.CharField(required=False, allow_blank=True)

    cpf = serializers.CharField(required=False, allow_blank=True)
    telefone = serializers.CharField(required=False, allow_blank=True)

    cartorio = serializers.IntegerField(required=False)

    cartorios_vinculados = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True,
        write_only=True,
    )

    cargo_judicial = serializers.ChoiceField(
        choices=User.CargoJudicial.choices,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = User
        fields = [
            "email",
            "username",
            "cpf",
            "telefone",
            "role",
            "cartorio",
            "cartorios_vinculados",
            "cargo_judicial",
            "password",
        ]

    def validate_role(self, value):
        request = self.context.get("request")
        if not request or not request.user or not request.user.is_authenticated:
            return User.Roles.CLIENTE
        if request.user.role == User.Roles.SUPERADMIN:
            return value
        return User.Roles.CLIENTE

    def validate(self, attrs):
        role = attrs.get("role", User.Roles.CLIENTE)
        cargo_judicial = attrs.get("cargo_judicial")

        if role == User.Roles.PROFISSIONAL and not cargo_judicial:
            raise serializers.ValidationError(
                {"cargo_judicial": "Obrigatório quando role=profissional."}
            )

        if role != User.Roles.PROFISSIONAL and cargo_judicial:
            raise serializers.ValidationError(
                {"cargo_judicial": "Só aceito cargo_judicial quando role=profissional."}
            )

        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        cartorio_id = validated_data.pop("cartorio", None)
        cartorios_ids = validated_data.pop("cartorios_vinculados", [])

        email = validated_data.get("email")
        if not validated_data.get("username"):
            validated_data["username"] = email

        user = User(**validated_data)
        user.set_password(password)

        if hasattr(user, "cartorio_id"):
            if cartorio_id in (None, "", "nenhum"):
                user.cartorio = None
            else:
                user.cartorio_id = int(cartorio_id)

        user.save()

        if cartorios_ids and hasattr(user, "cartorios_vinculados"):
            user.cartorios_vinculados.set(cartorios_ids)

        return user


class UsuarioUpdateSerializer(serializers.ModelSerializer):
    cpf = serializers.CharField(required=False, allow_blank=True)
    telefone = serializers.CharField(required=False, allow_blank=True)

    cargo_judicial = serializers.ChoiceField(
        choices=User.CargoJudicial.choices,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = User
        fields = [
            "email",
            "username",
            "cpf",
            "telefone",
            "role",
            "cargo_judicial",
            "is_active",
        ]

    def validate(self, attrs):
        role = attrs.get("role", getattr(self.instance, "role", None))
        cargo_judicial = attrs.get(
            "cargo_judicial", getattr(self.instance, "cargo_judicial", None)
        )

        if role == User.Roles.PROFISSIONAL and not cargo_judicial:
            raise serializers.ValidationError(
                {"cargo_judicial": "Obrigatório quando role=profissional."}
            )

        if role != User.Roles.PROFISSIONAL and cargo_judicial:
            raise serializers.ValidationError(
                {"cargo_judicial": "Só aceito cargo_judicial quando role=profissional."}
            )

        return attrs


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"