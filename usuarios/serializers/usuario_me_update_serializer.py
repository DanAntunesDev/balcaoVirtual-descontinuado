from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UsuarioMeUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "email",
            "telefone",
            "notificar_email",
            "notificar_whatsapp",
            "lembrete_automatico_agendamento",
        ]

    def validate_email(self, value):
        value = (value or "").strip().lower()
        if not value:
            raise serializers.ValidationError("E-mail inválido.")

        qs = User.objects.filter(email__iexact=value).exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Este e-mail já está em uso.")

        return value