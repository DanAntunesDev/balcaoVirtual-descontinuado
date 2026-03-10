"""
Aqui eu concentro todas as validações específicas do usuário,
mantendo o serializer limpo e evitando regras de negócio dentro da view.
"""

import re
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError

User = get_user_model()


class UsuarioValidator:
    """
    Classe responsável por regras de validação complexas.
    Aqui eu implemento a validação completa do CPF (algoritmo oficial)
    e a verificação de unicidade.
    """

    @staticmethod
    def validar_cpf_real(cpf: str):
        """
        Aqui eu valido o CPF:
        - remove caracteres não numéricos
        - exige 11 dígitos
        - recusa CPFs repetidos
        - aplica o algoritmo oficial de validação
        """

        cpf = re.sub(r"\D", "", cpf or "")

        if len(cpf) != 11:
            raise ValidationError("O CPF deve conter 11 dígitos.")

        # rejeita CPFs como 000… 111… 222… etc
        if cpf in {c * 11 for c in "0123456789"}:
            raise ValidationError("CPF inválido.")

        # cálculo do dígito verificador 1
        soma = sum(int(cpf[i]) * (10 - i) for i in range(9))
        digito1 = (soma * 10 % 11) % 10

        # cálculo do dígito verificador 2
        soma = sum(int(cpf[i]) * (11 - i) for i in range(10))
        digito2 = (soma * 10 % 11) % 10

        if cpf[-2:] != f"{digito1}{digito2}":
            raise ValidationError("CPF inválido.")

        return cpf

    @staticmethod
    def validar_unicidade_cpf(cpf: str, usuario_id: int = None):
        """
        Aqui eu valido se o CPF é único no banco.
        Aceita edição: o próprio usuário pode alterar seu CPF.
        """

        existe = User.objects.filter(cpf=cpf)

        if usuario_id:
            existe = existe.exclude(id=usuario_id)

        if existe.exists():
            raise ValidationError("Este CPF já está cadastrado.")

    @staticmethod
    def validar_cpf(cpf: str, usuario_id: int = None):
        """
        Método usado pelo serializer para validação final.
        """
        cpf = UsuarioValidator.validar_cpf_real(cpf)
        UsuarioValidator.validar_unicidade_cpf(cpf, usuario_id)
        return cpf
