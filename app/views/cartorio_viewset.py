from rest_framework.viewsets import ModelViewSet
from app.models import Cartorio
from app.serializers import CartorioSerializer


class CartorioViewSet(ModelViewSet):
    """
    ViewSet único de Cartório.
    Usado por frontend e admin.
    """

    queryset = Cartorio.objects.select_related(
        "municipio",
        "tipo_cartorio",
    )
    serializer_class = CartorioSerializer