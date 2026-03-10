import re

from rest_framework.exceptions import ValidationError


# ==========================================================
# Helpers
# ==========================================================

def only_digits(value: str | None) -> str:
    """
    Remove tudo que não for número.
    """
    return re.sub(r"\D", "", value or "")


# ==========================================================
# CPF
# ==========================================================

def validate_cpf(value: str) -> str:
    """
    Validação completa de CPF brasileiro.

    - Aceita com ou sem máscara
    - Retorna apenas números
    """
    cpf = only_digits(value)

    if len(cpf) != 11:
        raise ValidationError("CPF deve conter 11 dígitos.")

    # Rejeita CPFs com todos dígitos iguais (11111111111 etc)
    if cpf == cpf[0] * 11:
        raise ValidationError("CPF inválido.")

    # Validação dos dígitos verificadores
    for i in range(9, 11):
        soma = sum(int(cpf[num]) * ((i + 1) - num) for num in range(i))
        digito = ((soma * 10) % 11) % 10
        if int(cpf[i]) != digito:
            raise ValidationError("CPF inválido.")

    return cpf


# ==========================================================
# TELEFONE BR
# ==========================================================

def validate_phone_br(value: str) -> str:
    """
    Valida telefone brasileiro.

    Aceita com máscara.

    Exemplos válidos:
    - 11999999999
    - (11) 99999-9999
    - 1133334444
    """
    phone = only_digits(value)

    if len(phone) not in (10, 11):
        raise ValidationError("Telefone inválido.")

    # DDD não pode começar com 0
    if phone[:2].startswith("0"):
        raise ValidationError("DDD inválido.")

    return phone


# ==========================================================
# Compatibilidade com código legado
# ==========================================================

def validar_cpf(value: str) -> str:
    """
    Alias legado (português).
    """
    return validate_cpf(value)


def validar_telefone(value: str) -> str:
    """
    Alias legado (português).
    """
    return validate_phone_br(value)


__all__ = [
    "only_digits",
    "validate_cpf",
    "validate_phone_br",
    "validar_cpf",
    "validar_telefone",
]
