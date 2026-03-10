from rest_framework import viewsets, filters
from app.models import TipoCartorio
from app.serializers import TipoCartorioSerializer
from app.models import StatusAtivo

class TipoCartorioViewSet(viewsets.ModelViewSet):
    queryset = TipoCartorio.objects.filter(status=StatusAtivo.ATIVO)
    serializer_class = TipoCartorioSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["nome"]