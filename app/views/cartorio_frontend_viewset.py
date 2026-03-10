from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.permissions import IsAuthenticated

from app.models import Cartorio
from app.serializers import CartorioFrontendSerializer


class CartorioFrontendViewSet(ReadOnlyModelViewSet):
    """
    Endpoint usado pelo frontend autenticado.
    Apenas leitura (list/retrieve).
    """

    serializer_class = CartorioFrontendSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Cartorio.objects
            .select_related("municipio", "tipo_cartorio")
            .all()
            .order_by("nome")
        )