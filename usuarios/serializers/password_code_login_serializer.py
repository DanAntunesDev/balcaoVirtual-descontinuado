from rest_framework import serializers


class PasswordCodeLoginSerializer(serializers.Serializer):
    identificador = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    cpf = serializers.CharField(required=False, allow_blank=True)
    code = serializers.CharField()

    def validate(self, attrs):
        identificador = (attrs.get("identificador") or "").strip()
        email = (attrs.get("email") or "").strip()
        cpf = (attrs.get("cpf") or "").strip()
        code = (attrs.get("code") or "").strip()

        if not identificador and not email and not cpf:
            raise serializers.ValidationError(
                {"detail": "Informe email ou CPF."}
            )

        if not code:
            raise serializers.ValidationError(
                {"detail": "Informe o código."}
            )

        return attrs