import re


def somente_digitos(valor: str) -> str:
    return re.sub(r"\D", "", valor or "")


def validar_cnpj(valor: str) -> bool:
    """
    Valida CNPJ (algoritmo oficial dos dígitos verificadores).
    Aceita com máscara ou sem máscara.
    """
    cnpj = somente_digitos(valor)

    if len(cnpj) != 14:
        return False

    # rejeita sequência repetida
    if cnpj == cnpj[0] * 14:
        return False

    def calc_dv(base: str) -> str:
        pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        pesos2 = [6] + pesos1

        def dv(parcial: str, pesos: list[int]) -> int:
            soma = sum(int(d) * p for d, p in zip(parcial, pesos))
            resto = soma % 11
            return 0 if resto < 2 else 11 - resto

        d1 = dv(base, pesos1)
        d2 = dv(base + str(d1), pesos2)
        return f"{d1}{d2}"

    base = cnpj[:12]
    dv = cnpj[12:]
    return calc_dv(base) == dv
