import logging

from django.views.decorators.cache import cache_page

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from app.models import Cartorio, StatusAtivo
from app.serializers import CartorioPublicoSerializer


logger = logging.getLogger(__name__)


@api_view(["GET"])
@permission_classes([AllowAny])
@cache_page(60 * 5)  # 5 minutos
def listar_cartorios(request):
    """Lista pública de cartórios (sem autenticação).

    Harden:
    - Endpoint público
    - Cacheado
    - Não vaza erro interno
    - Filtra por status ATIVO (model real)
    - Query otimizada com select_related
    """

    try:
        cartorios = (
            Cartorio.objects
            .select_related("municipio", "tipo_cartorio")
            .filter(status=StatusAtivo.ATIVO)
            .order_by("nome")
        )

        serializer = CartorioPublicoSerializer(cartorios, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception:
        logger.exception("Erro ao listar cartórios públicos")
        return Response(
            {"detail": "Erro ao carregar cartórios."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )