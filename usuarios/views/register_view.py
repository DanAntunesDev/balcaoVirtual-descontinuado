from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from usuarios.serializers.register_serializer import RegisterPublicSerializer
from app.services.email_service import enviar_email_boas_vindas


class RegisterView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = RegisterPublicSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        try:
            enviar_email_boas_vindas(user)
        except Exception:
            pass

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": getattr(user, "role", None),
                },
                "tenant": None,
                "roles": list(user.groups.values_list("name", flat=True)),
            },
            status=status.HTTP_201_CREATED,
        )