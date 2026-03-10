import pytest
from datetime import date, time

from django.core.exceptions import ValidationError

from app.models import Cartorio, StatusAtivo
from app.services.horario_service import HorarioService


@pytest.mark.django_db
class TestHorarioService:
    def test_cartorio_inexistente(self):
        with pytest.raises(ValidationError):
            HorarioService.get_horarios_disponiveis(999999, date.today())

    def test_cartorio_inativo(self):
        c = Cartorio.objects.create(nome="C1", status=StatusAtivo.INATIVO)
        with pytest.raises(ValidationError):
            HorarioService.get_horarios_disponiveis(c.id, date.today())

    def test_sem_horario_configurado(self):
        c = Cartorio.objects.create(nome="C1", status=StatusAtivo.ATIVO, abertura=None, fechamento=None)
        with pytest.raises(ValidationError):
            HorarioService.get_horarios_disponiveis(c.id, date.today())

    def test_fechamento_antes_abertura(self):
        c = Cartorio.objects.create(
            nome="C1",
            status=StatusAtivo.ATIVO,
            abertura=time(18, 0),
            fechamento=time(9, 0),
        )
        with pytest.raises(ValidationError):
            HorarioService.get_horarios_disponiveis(c.id, date.today())

    def test_retorna_slots_30_min(self):
        c = Cartorio.objects.create(
            nome="C1",
            status=StatusAtivo.ATIVO,
            abertura=time(9, 0),
            fechamento=time(10, 30),
        )
        horarios = HorarioService.get_horarios_disponiveis(c.id, date.today())
        # 09:00, 09:30, 10:00 (para antes de 10:30)
        assert len(horarios) == 3
