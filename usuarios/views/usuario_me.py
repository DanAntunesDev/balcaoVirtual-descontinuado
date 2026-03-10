from django.contrib.auth.password_validation import validate_password
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from usuarios.permissions.base import IsActiveUser
from usuarios.serializers.usuario_serializer import UsuarioDetailSerializer
from usuarios.serializers.usuario_me_update_serializer import UsuarioMeUpdateSerializer

from app.services.email_service import (
    enviar_email_senha_alterada,
)


class UsuarioMeView(APIView):
    """
    /usuarios/v1/me/
    GET: retorna o próprio usuário
    PATCH: atualiza dados pessoais + preferências
    """

    permission_classes = [IsAuthenticated, IsActiveUser]

    def get(self, request):
        data = UsuarioDetailSerializer(request.user).data
        return Response(data)

    def patch(self, request):
        serializer = UsuarioMeUpdateSerializer(
            request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UsuarioDetailSerializer(user).data, status=status.HTTP_200_OK)


class UsuarioAlterarSenhaView(APIView):
    """
    POST /usuarios/v1/me/alterar-senha/
    """
    permission_classes = [IsAuthenticated, IsActiveUser]

    def post(self, request):
        current_password = request.data.get("current_password") or ""
        new_password = request.data.get("new_password") or ""
        confirm_password = request.data.get("confirm_password") or ""

        if not request.user.check_password(current_password):
            return Response(
                {"detail": "Senha atual inválida."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if new_password != confirm_password:
            return Response(
                {"detail": "Confirmação de senha não confere."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        validate_password(new_password, user=request.user)

        request.user.set_password(new_password)
        request.user.save(update_fields=["password"])

        try:
            enviar_email_senha_alterada(request.user)
        except Exception:
            pass

        return Response(
            {"detail": "Senha alterada com sucesso."},
            status=status.HTTP_200_OK,
        )


class UsuarioExcluirContaView(APIView):
    """
    POST /usuarios/v1/me/excluir-conta/
    Desativa e anonimiza o usuário (mantém histórico/agendamentos).
    """
    permission_classes = [IsAuthenticated, IsActiveUser]

    def post(self, request):
        confirm_text = (request.data.get("confirm_text") or "").strip().upper()
        if confirm_text != "EXCLUIR":
            return Response(
                {"detail": "Confirmação inválida. Digite EXCLUIR."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user

        user.is_active = False

        deleted_email = f"deleted_{user.id}@deleted.local"
        user.email = deleted_email
        user.username = deleted_email

        user.first_name = ""
        user.last_name = ""
        user.cpf = None
        user.telefone = None

        user.notificar_email = False
        user.notificar_whatsapp = False
        user.lembrete_automatico_agendamento = False

        user.set_unusable_password()
        user.save()

        return Response(
            {"detail": "Conta desativada com sucesso."},
            status=status.HTTP_200_OK,
        )