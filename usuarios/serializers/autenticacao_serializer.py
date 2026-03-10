from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


def _only_digits(value: str) -> str:
    return "".join(ch for ch in str(value or "") if ch.isdigit())


class LoginSerializer(serializers.Serializer):
    identificador = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    cpf = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        password = (attrs.get("password") or "").strip()

        raw_login = (
            attrs.get("identificador")
            or attrs.get("email")
            or attrs.get("cpf")
            or ""
        ).strip()

        if not raw_login:
            raise serializers.ValidationError(
                {"detail": "Informe email ou CPF para entrar."}
            )

        if not password:
            raise serializers.ValidationError(
                {"detail": "Informe a senha."}
            )

        cpf = _only_digits(raw_login)
        user_obj = None

        if "@" in raw_login:
            user_obj = User.objects.filter(email__iexact=raw_login.lower()).first()

        if user_obj is None and cpf:
            user_obj = User.objects.filter(cpf=cpf).first()

        if user_obj is None and raw_login:
            user_obj = User.objects.filter(username__iexact=raw_login).first()

        if user_obj is None:
            raise serializers.ValidationError({"detail": "Credenciais inválidas."})

        if not user_obj.check_password(password):
            raise serializers.ValidationError({"detail": "Credenciais inválidas."})

        if not user_obj.is_active:
            raise serializers.ValidationError({"detail": "Usuário inativo."})

        return {
            "user": user_obj,
            "identificador": raw_login,
        }