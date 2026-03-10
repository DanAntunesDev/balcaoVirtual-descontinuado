from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.permissions import AllowAny

from app.models import CategoriaDocumento, StatusAtivo
from rest_framework import serializers


class CategoriaDocumentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoriaDocumento
        fields = ["id", "nome"]


class CategoriaDocumentoViewSet(ReadOnlyModelViewSet):
    """
    Endpoint público (somente leitura) para o frontend consumir categorias de documentos.
    As categorias são cadastradas no SuperAdmin.

    GET /api/v1/documentos/categorias/
    """
    permission_classes = [AllowAny]
    serializer_class = CategoriaDocumentoSerializer

    def get_queryset(self):
        return CategoriaDocumento.objects.filter(status=StatusAtivo.ATIVO).order_by("nome")