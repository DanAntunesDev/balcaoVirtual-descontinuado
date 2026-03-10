from rest_framework import serializers


class PasswordRequestSerializer(serializers.Serializer):
    identificador = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    cpf = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        identificador = (attrs.get("identificador") or "").strip()
        email = (attrs.get("email") or "").strip()
        cpf = (attrs.get("cpf") or "").strip()

        if not identificador and not email and not cpf:
            raise serializers.ValidationError(
                {"detail": "Informe email ou CPF para solicitar o código."}
            )

        return attrs