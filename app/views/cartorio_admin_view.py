from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from app.models import Cartorio
from usuarios.models.usuario import User
from usuarios.permissions.base import IsActiveUser
from usuarios.permissions.permissions import IsSuperAdmin


class CartorioAdminCreateView(APIView):
    """
    Aqui eu permito que o SuperAdmin crie um Admin
    já vinculado a um Cartório específico.
    """

    permission_classes = [IsAuthenticated, IsActiveUser, IsSuperAdmin]

    def post(self, request, cartorio_id):
        """
        Aqui eu crio o Admin do cartório.
        """

        try:
            cartorio = Cartorio.objects.get(id=cartorio_id)
        except Cartorio.DoesNotExist:
            return Response(
                {"detail": "Cartório não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        email = request.data.get("email")
        username = request.data.get("username")
        password = request.data.get("password")

        if not email or not username or not password:
            return Response(
                {"detail": "Informe email, username e password."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {"detail": "Já existe um usuário com este email."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {"detail": "Já existe um usuário com este username."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Aqui eu crio o Admin já vinculado ao cartório
        user = User.objects.create_user(
            email=email,
            username=username,
            password=password,
            role=User.Role.ADMIN,
            cartorio=cartorio,
        )

        return Response(
            {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "cartorio": cartorio.nome,
            },
            status=status.HTTP_201_CREATED,
        )
