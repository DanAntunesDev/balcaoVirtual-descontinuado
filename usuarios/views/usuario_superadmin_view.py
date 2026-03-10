from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated

from usuarios.models.usuario import User
from usuarios.permissions.base import IsActiveUser
from usuarios.permissions.permissions import IsSuperAdmin

from usuarios.serializers.usuario_list_serializer import UsuarioListSerializer
from usuarios.serializers.usuario_superadmin_create_serializer import (
    UsuarioSuperAdminCreateSerializer,
)


class UsuarioSuperAdminViewSet(ModelViewSet):
    """
    ViewSet exclusivo para ações de SuperAdmin.
    """

    queryset = User.objects.all()
    permission_classes = [
        IsAuthenticated,
        IsActiveUser,
        IsSuperAdmin,
    ]

    def get_serializer_class(self):
        """
        Eu separo claramente:
        - listagem → UsuarioListSerializer
        - criação → UsuarioSuperAdminCreateSerializer
        """
        if self.action == "create":
            return UsuarioSuperAdminCreateSerializer

        return UsuarioListSerializer
