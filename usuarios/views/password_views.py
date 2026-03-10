from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from usuarios.serializers import (
    PasswordRequestSerializer,
    PasswordCodeLoginSerializer,
    PasswordResetSerializer,
)
from usuarios.services.password_reset_service import PasswordResetService


class PasswordRequestView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = PasswordRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        PasswordResetService.request_reset(
            email=serializer.validated_data.get("email"),
            cpf=serializer.validated_data.get("cpf"),
            identifier=serializer.validated_data.get("identificador"),
            ip=request.META.get("REMOTE_ADDR"),
            user_agent=request.META.get("HTTP_USER_AGENT"),
        )

        return Response(
            {"detail": "Código enviado."},
            status=status.HTTP_200_OK,
        )


class PasswordCodeLoginView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = PasswordCodeLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        reset_obj = PasswordResetService.validate_code(
            email=serializer.validated_data.get("email"),
            cpf=serializer.validated_data.get("cpf"),
            identifier=serializer.validated_data.get("identificador"),
            code=serializer.validated_data.get("code"),
        )

        user = reset_obj.user
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "detail": "Código válido.",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                },
            },
            status=status.HTTP_200_OK,
        )


class PasswordResetView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        reset_obj = PasswordResetService.validate_code(
            email=serializer.validated_data.get("email"),
            cpf=serializer.validated_data.get("cpf"),
            identifier=serializer.validated_data.get("identificador"),
            code=serializer.validated_data.get("code"),
        )

        user = reset_obj.user
        new_password = serializer.validated_data["new_password"]

        user.set_password(new_password)
        user.save(update_fields=["password"])

        reset_obj.mark_used()

        return Response(
            {"detail": "Senha alterada com sucesso."},
            status=status.HTTP_200_OK,
        )