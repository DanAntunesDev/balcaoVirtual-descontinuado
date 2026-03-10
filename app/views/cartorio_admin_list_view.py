from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated

from app.models import Cartorio
from app.serializers import CartorioSerializer
from usuarios.permissions.base import IsActiveUser
from usuarios.permissions.permissions import IsAdminOrSuperAdmin


class CartorioAdminListView(ListAPIView):
    """
    Listagem administrativa de cartórios.

    - SUPERADMIN: vê todos
    - ADMIN: vê apenas seu cartório
    """

    serializer_class = CartorioSerializer
    permission_classes = [
        IsAuthenticated,
        IsActiveUser,
        IsAdminOrSuperAdmin,
    ]

    queryset = Cartorio.objects.all()

    def get_queryset(self):
        user = self.request.user

        if user.role == user.Role.SUPERADMIN:
            return self.queryset

        # ADMIN
        return self.queryset.filter(id=user.cartorio_id)
