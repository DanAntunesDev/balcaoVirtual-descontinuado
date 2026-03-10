from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from usuarios.serializers.me_serializer import MeSerializer


class MeView(APIView):
    """
    Endpoint responsável por retornar o contexto do usuário logado.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Eu retorno apenas informações de contexto.
        Nenhuma regra de negócio vive aqui.
        """
        serializer = MeSerializer(request.user)
        return Response(serializer.data)
