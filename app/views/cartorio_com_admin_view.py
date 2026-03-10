from django.db import transaction

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from app.models import Cartorio
from usuarios.models.usuario import User
from usuarios.permissions.base import IsActiveUser
from usuarios.permissions.permissions import IsSuperAdmin




class CartorioComAdminCreateView(APIView):
    """
    Aqui eu crio um Cartório e um Admin no mesmo fluxo.
    Esse endpoint é exclusivo do SuperAdmin.
    """

    permission_classes = [IsAuthenticated, IsActiveUser, IsSuperAdmin]

    @transaction.atomic
    def post(self, request):
        """
        Aqui eu garanto que Cartório e Admin
        sejam criados de forma atômica.
        """

        cartorio_data = request.data.get("cartorio")
        admin_data = request.data.get("admin")

        if not cartorio_data or not admin_data:
            return Response(
                {"detail": "Informe os dados de cartório e admin."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ==============================
        # Validação básica do cartório
        # ==============================
        nome = cartorio_data.get("nome")
        cidade = cartorio_data.get("cidade")
        estado = cartorio_data.get("estado")

        if not nome or not cidade or not estado:
            return Response(
                {"detail": "Dados incompletos do cartório."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ==============================
        # Validação básica do admin
        # ==============================
        email = admin_data.get("email")
        username = admin_data.get("username")
        password = admin_data.get("password")

        if not email or not username or not password:
            return Response(
                {"detail": "Dados incompletos do admin."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {"detail": "Já existe usuário com este email."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {"detail": "Já existe usuário com este username."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ==============================
        # Criação do cartório
        # ==============================
        cartorio = Cartorio.objects.create(
            nome=nome,
            cidade=cidade,
            estado=estado,
            ativo=True,
        )

        # ==============================
        # Criação do admin
        # ==============================
        admin = User.objects.create_user(
            email=email,
            username=username,
            password=password,
            role=User.Role.ADMIN,
            cartorio=cartorio,
        )

        return Response(
            {
                "cartorio": {
                    "id": cartorio.id,
                    "nome": cartorio.nome,
                },
                "admin": {
                    "id": admin.id,
                    "email": admin.email,
                    "username": admin.username,
                },
            },
            status=status.HTTP_201_CREATED,
        )
