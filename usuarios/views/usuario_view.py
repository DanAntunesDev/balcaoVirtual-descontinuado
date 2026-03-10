from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from app.models import Cartorio
from app.services.auditoria_service import AuditoriaService
from usuarios.models.usuario import User
from usuarios.permissions.permissions import IsAdminOrSuperAdmin
from usuarios.serializers.usuario_list_serializer import UsuarioListSerializer
from usuarios.serializers.usuario_serializer import (
    UsuarioCreateSerializer,
    UsuarioDetailSerializer,
)
from usuarios.serializers.usuario_superadmin_create_serializer import (
    UsuarioSuperAdminCreateSerializer,
)
from usuarios.serializers.usuario_update_serializer import UsuarioUpdateSerializer
from usuarios.serializers.usuario_vinculo_cartorio_serializer import (
    UsuarioVinculoCartorioSerializer,
)


class UsuarioViewSet(viewsets.ModelViewSet):
    """
    Usuários (administração)

    Regras:
    - SUPERADMIN: vê tudo
    - ADMIN: vê apenas usuários do próprio cartório
    - Demais: não acessam esse ViewSet
    """

    queryset = User.objects.none()
    permission_classes = [IsAuthenticated]

    # -------------------------
    # Helpers
    # -------------------------
    def _role(self) -> str:
        return str(getattr(self.request.user, "role", "")).lower()

    def _is_superadmin(self) -> bool:
        return self._role() == "superadmin" or bool(
            getattr(self.request.user, "is_superuser", False)
        )

    def _is_admin(self) -> bool:
        return self._role() == "admin"

    # -------------------------
    # Permissions
    # -------------------------
    def get_permissions(self):
        if self.action in {
            "list",
            "retrieve",
            "create",
            "update",
            "partial_update",
            "destroy",
            "alterar_role",
            "vincular_cartorio",
        }:
            return [IsAuthenticated(), IsAdminOrSuperAdmin()]
        return [IsAuthenticated()]

    # -------------------------
    # Serializers
    # -------------------------
    def get_serializer_class(self):
        if self.action == "list":
            return UsuarioListSerializer

        if self.action == "retrieve":
            return UsuarioDetailSerializer

        if self.action == "create":
            if self._is_superadmin():
                return UsuarioSuperAdminCreateSerializer
            return UsuarioCreateSerializer

        if self.action in {"update", "partial_update"}:
            return UsuarioUpdateSerializer

        return UsuarioDetailSerializer

    # -------------------------
    # Queryset scoping
    # -------------------------
    def get_queryset(self):
        user = self.request.user

        base = (
            User.objects
            .select_related("cartorio")
            .only(
                "id",
                "email",
                "role",
                "cargo_judicial",
                "is_active",
                "date_joined",
                "cartorio_id",
            )
            .order_by("-date_joined")
        )

        if self._is_superadmin():
            return base

        if self._is_admin():
            if not getattr(user, "cartorio_id", None):
                return User.objects.none()
            return base.filter(cartorio_id=user.cartorio_id)

        return User.objects.none()

    # -------------------------
    # Create
    # -------------------------
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        if not (self._is_superadmin() or self._is_admin()):
            return Response(
                {"detail": "Sem permissão."},
                status=status.HTTP_403_FORBIDDEN,
            )

        payload = request.data.copy()

        # GARANTE USERNAME AUTOMÁTICO
        if not payload.get("username"):
            payload["username"] = payload.get("email")

        # Se for SUPERADMIN criando ADMIN e não vier cartorio,
        # não bloqueia criação (deixa null)
        if self._is_superadmin() and not payload.get("cartorio"):
            payload["cartorio"] = None

        # ADMIN: força cartório do próprio usuário
        if self._is_admin():
            if not request.user.cartorio_id:
                return Response(
                    {"detail": "Admin sem cartório vinculado."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            payload["cartorio"] = request.user.cartorio_id

        serializer = self.get_serializer(data=payload)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        novo_usuario = serializer.save()

        AuditoriaService.registrar_evento(
            tipo_evento="criacao_usuario",
            usuario_executor=request.user,
            usuario_afetado=novo_usuario,
            descricao=f"Usuário criado (id={novo_usuario.id}).",
            metadata={
                "novo_usuario_id": novo_usuario.id,
                "novo_usuario_role": novo_usuario.role,
                "cartorio_id": novo_usuario.cartorio_id,
            },
        )

        return Response(
            UsuarioDetailSerializer(novo_usuario).data,
            status=status.HTTP_201_CREATED,
        )

    # -------------------------
    # Destroy (Soft delete)
    # -------------------------
    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance.id == request.user.id:
            return Response(
                {"detail": "Você não pode desativar a si mesmo."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        instance.is_active = False
        instance.save(update_fields=["is_active"])

        AuditoriaService.registrar_evento(
            tipo_evento="desativacao_usuario",
            usuario_executor=request.user,
            usuario_afetado=instance,
            descricao=f"Usuário desativado (id={instance.id}).",
            metadata={"is_active": False},
        )

        return Response(status=status.HTTP_204_NO_CONTENT)

    # -------------------------
    # Actions
    # -------------------------
    @action(detail=True, methods=["post"])
    @transaction.atomic
    def alterar_role(self, request, pk=None):
        usuario = get_object_or_404(self.get_queryset(), pk=pk)

        old_role = usuario.role
        old_cargo = usuario.cargo_judicial

        new_role = request.data.get("role")
        new_cargo = request.data.get("cargo_judicial")

        if new_role:
            usuario.role = new_role

        if new_cargo is not None:
            usuario.cargo_judicial = new_cargo

        usuario.save(update_fields=["role", "cargo_judicial"])

        AuditoriaService.registrar_evento(
            tipo_evento="alteracao_role",
            usuario_executor=request.user,
            usuario_afetado=usuario,
            descricao=f"Role alterado para usuário id={usuario.id}.",
            metadata={
                "before": {"role": old_role, "cargo_judicial": old_cargo},
                "after": {
                    "role": usuario.role,
                    "cargo_judicial": usuario.cargo_judicial,
                },
            },
        )

        return Response(
            UsuarioDetailSerializer(usuario).data,
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def vincular_cartorio(self, request, pk=None):
        usuario = get_object_or_404(self.get_queryset(), pk=pk)
        role = self._role()

        serializer = UsuarioVinculoCartorioSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cartorio_id = serializer.validated_data["cartorio_id"]

        if role == "admin":
            cartorio_id = request.user.cartorio_id

        cartorio = get_object_or_404(Cartorio, pk=cartorio_id)

        old_cartorio_id = usuario.cartorio_id

        usuario.cartorio = cartorio
        usuario.save(update_fields=["cartorio"])

        AuditoriaService.registrar_evento(
            tipo_evento="vinculo_cartorio",
            usuario_executor=request.user,
            usuario_afetado=usuario,
            descricao=f"Cartório alterado para usuário id={usuario.id}.",
            metadata={
                "before": {"cartorio_id": old_cartorio_id},
                "after": {"cartorio_id": usuario.cartorio_id},
            },
        )

        return Response(
            {
                "detail": "Cartório vinculado com sucesso.",
                "cartorio_id": usuario.cartorio_id,
            },
            status=status.HTTP_200_OK,
        )
