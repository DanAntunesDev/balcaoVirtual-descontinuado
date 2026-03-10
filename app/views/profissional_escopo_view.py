from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from usuarios.permissions.base import IsActiveUser
from usuarios.permissions.cargo_matrix import get_permissoes_por_cargo


class ProfissionalEscopoView(APIView):
    permission_classes = [IsAuthenticated, IsActiveUser]

    def get(self, request):
        user = request.user

        permissoes = {}
        if getattr(user, "role", None) == "profissional":
            permissoes = get_permissoes_por_cargo(getattr(user, "cargo_judicial", None))

        return Response(
            {
                "id": user.id,
                "email": getattr(user, "email", None),
                "username": getattr(user, "username", None),
                "role": getattr(user, "role", None),
                "cargo_judicial": getattr(user, "cargo_judicial", None),
                "cartorio_id": getattr(user, "cartorio_id", None),
                "permissoes": permissoes,
            }
        )
