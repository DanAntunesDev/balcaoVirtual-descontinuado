from rest_framework import viewsets, filters

from app.models import Municipios
from app.serializers import MunicipiosSerializer
from app.models import StatusAtivo

class MunicipioViewSet(viewsets.ModelViewSet):
    queryset = Municipios.objects.filter(status=StatusAtivo.ATIVO)
    serializer_class = MunicipiosSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["nome", "uf"]
