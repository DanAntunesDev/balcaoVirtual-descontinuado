from app.models import Agendamento


def dashboard_estagiario(usuario):
    """
    Dashboard do Estagiário.

    Aqui eu:
    - entrego visão somente leitura
    - sem métricas sensíveis
    """

    agendamentos = Agendamento.objects.filter(profissional=usuario)

    return {
        "cards": {
            "agendamentos_vinculados": agendamentos.count(),
        },
        "series": {},
    }
