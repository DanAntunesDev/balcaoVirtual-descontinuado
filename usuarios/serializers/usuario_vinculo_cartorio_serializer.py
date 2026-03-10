from rest_framework import serializers


class UsuarioVinculoCartorioSerializer(serializers.Serializer):
    cartorio_id = serializers.IntegerField()
