from rest_framework.views import APIView
from rest_framework.response import Response

from django.contrib.auth import get_user_model

from rest_framework.permissions import IsAuthenticated
from usuarios.permissions.permissions import IsSuperAdmin


from app.models import Cartorio, Agendamento, Atendimento

User = get_user_model()


class DashboardSuperAdminView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request):
        data = {
            "total_usuarios": User.objects.count(),
            "total_cartorios": Cartorio.objects.count(),
            "total_agendamentos": Agendamento.objects.count(),
            "total_atendimentos": Atendimento.objects.count(),
        }

        return Response(data)