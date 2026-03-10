from django.contrib.auth import get_user_model
from rest_framework import serializers
from usuarios.serializers.validators import validar_cpf

User = get_user_model()


class RegisterPublicSerializer(serializers.Serializer):
    nome = serializers.CharField()
    cpf = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)

    def validate_cpf(self, value):
        cpf = ''.join(filter(str.isdigit, value))
        if not validar_cpf(cpf):
            raise serializers.ValidationError("CPF inválido.")
        if User.objects.filter(cpf=cpf).exists():
            raise serializers.ValidationError("CPF já cadastrado.")
        return cpf

    def validate_email(self, value):
        email = value.lower().strip()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("E-mail já cadastrado.")
        return email

    def create(self, validated_data):
        nome = validated_data["nome"].strip()
        cpf = validated_data["cpf"]
        email = validated_data["email"]
        password = validated_data["password"]

        parts = nome.split()
        first_name = parts[0]
        last_name = " ".join(parts[1:]) if len(parts) > 1 else ""

        user = User(
            cpf=cpf,
            email=email,
            username=cpf,  # username vira apenas técnico
            first_name=first_name,
            last_name=last_name,
            role=User.Roles.CLIENTE,
            is_active=True,
        )
        user.set_password(password)
        user.full_clean()
        user.save()
        return user
