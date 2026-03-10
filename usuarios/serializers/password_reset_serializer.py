from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers


class PasswordResetSerializer(serializers.Serializer):
    identificador = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    cpf = serializers.CharField(required=False, allow_blank=True)
    code = serializers.CharField()
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
    )

    def validate(self, data):
        identificador = (data.get("identificador") or "").strip()
        email = (data.get("email") or "").strip()
        cpf = (data.get("cpf") or "").strip()
        code = (data.get("code") or "").strip()
        new_password = data.get("new_password") or ""
        confirm_password = data.get("confirm_password")

        if not identificador and not email and not cpf:
            raise serializers.ValidationError("Informe email ou CPF.")

        if not code:
            raise serializers.ValidationError("Informe o código.")

        if confirm_password not in (None, "") and new_password != confirm_password:
            raise serializers.ValidationError("As senhas não coincidem.")

        validate_password(new_password)
        return data