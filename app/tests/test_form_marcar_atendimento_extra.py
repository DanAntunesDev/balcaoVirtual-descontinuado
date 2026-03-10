import pytest
from django.utils import timezone

from app.forms.marcar_atendimento import MarcarAtendimentoForm


@pytest.mark.django_db
class TestMarcarAtendimentoFormExtra:
    def test_form_campos_existem(self):
        form = MarcarAtendimentoForm()
        assert "data" in form.fields
        assert "hora" in form.fields
        assert "nome" in form.fields
        assert "telefone" in form.fields
        assert "email" in form.fields

    def test_form_valida_com_dados_minimos(self):
        # usa data/hora como strings compatíveis com DateField/TimeField
        today = timezone.localdate().isoformat()
        payload = {
            "data": today,
            "hora": "10:30",
            "nome": "Fulana",
            "telefone": "11999999999",
            "email": "fulana@test.com",
        }
        form = MarcarAtendimentoForm(data=payload)
        assert form.is_valid(), form.errors
