from datetime import datetime, timedelta
from typing import List

from django.core.exceptions import ValidationError
from django.utils import timezone

import pytz
import holidays

from app.models import Cartorio, Atendimento,StatusAtivo

def atualizar_status_cartorios():
    """Atualiza o status (aberto/fechado) de todos os cartórios"""
    fuso_brasil = pytz.timezone("America/Sao_Paulo")
    data_atual = datetime.datetime.now(fuso_brasil).date()
    horario_atual = datetime.datetime.now(fuso_brasil).time()
    feriados_brasil = holidays.Brazil(years=data_atual.year)
    agora = datetime.datetime.now(fuso_brasil)

    cartorios = Cartorio.objects.all()

    for cartorio in cartorios:
        if (
            cartorio.admin_modificado is None
            or (agora - cartorio.admin_modificado).total_seconds() >= 36000
        ):
            if (
                horario_atual < cartorio.horario_abertura
                or horario_atual > cartorio.horario_fechamento
                or data_atual in feriados_brasil
                or data_atual.weekday() in [5, 6]
            ):
                cartorio.status = False
            else:
                cartorio.status = True
            cartorio.save()


def listar_horarios_disponiveis(cartorio_id, dia_selecionado):
    """Retorna uma lista de horários disponíveis para um cartório em um dia específico"""
    try:
        cartorio = Cartorio.objects.get(id=cartorio_id)
        horarios_ocupados = Atendimento.objects.filter(
            cartorio=cartorio, dia=dia_selecionado, status=True
        ).values_list("hora", flat=True)

        horarios_ocupados = set(horarios_ocupados)

        horarios_disponiveis = []
        hora_atual = cartorio.horario_abertura
        while hora_atual <= cartorio.horario_fechamento:
            if hora_atual not in horarios_ocupados:
                horarios_disponiveis.append(hora_atual.strftime("%H:%M"))

            hora_atual = (
                datetime.datetime.combine(datetime.date.today(), hora_atual)
                + datetime.timedelta(minutes=30)
            ).time()

        return horarios_disponiveis

    except Cartorio.DoesNotExist:
        return []



class HorarioService:
    @staticmethod
    def get_horarios_disponiveis(cartorio_id: int, data) -> List[datetime]:
        """
        Retorna horários disponíveis a cada 30min dentro do intervalo de abertura/fechamento.
        """

        cartorio = Cartorio.objects.filter(id=cartorio_id).first()
        if not cartorio:
            raise ValidationError("Cartório não encontrado.")

        if getattr(cartorio, "status", None) != StatusAtivo.ATIVO:
            raise ValidationError("Cartório inativo.")

        # No seu model: abertura/fechamento
        if not cartorio.abertura or not cartorio.fechamento:
            raise ValidationError("Cartório sem horário de funcionamento configurado.")

        tz = timezone.get_current_timezone()
        abertura_dt = timezone.make_aware(datetime.combine(data, cartorio.abertura), tz)
        fechamento_dt = timezone.make_aware(datetime.combine(data, cartorio.fechamento), tz)

        if fechamento_dt <= abertura_dt:
            raise ValidationError("Horário de fechamento deve ser após o horário de abertura.")

        horarios = []
        atual = abertura_dt
        while atual < fechamento_dt:
            horarios.append(atual)
            atual += timedelta(minutes=30)

        return horarios
