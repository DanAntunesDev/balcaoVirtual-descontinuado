from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from usuarios.serializers.autenticacao_serializer import LoginSerializer


@api_view(["POST"])
@permission_classes([AllowAny])
def login_unificado(request):
    """
    Aqui eu faço o login unificado.
    Eu resolvo o usuário, determino o papel principal
    e retorno o contexto completo para o frontend.
    """

    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = serializer.validated_data["user"]

    # Aqui eu gero os tokens JWT
    refresh = RefreshToken.for_user(user)

    # Aqui eu determino o papel principal do usuário
    role_principal = user.role

    # Aqui eu preparo a resposta de login com contexto
    return Response(
        {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
            # Aqui eu retorno o papel principal de forma explícita
            "role": role_principal,
            # Aqui eu deixo preparado para multi-tenant
            "tenant": user.cartorio_id if user.cartorio_id else None,
        },
        status=status.HTTP_200_OK,
    )
