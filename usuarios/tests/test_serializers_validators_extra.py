import pytest
from rest_framework.exceptions import ValidationError

from usuarios.serializers.validators import validate_cpf, validate_phone_br


@pytest.mark.django_db
class TestUsuariosSerializersValidatorsExtra:
    def test_validate_phone_br(self):
        assert validate_phone_br("11999999999") == "11999999999"
        assert validate_phone_br("(11) 99999-9999") == "11999999999"
        with pytest.raises(ValidationError):
            validate_phone_br("123")

    def test_validate_cpf(self):
        # válido conhecido em testes
        assert validate_cpf("529.982.247-25") == "52998224725"
        with pytest.raises(ValidationError):
            validate_cpf("111.111.111-11")
