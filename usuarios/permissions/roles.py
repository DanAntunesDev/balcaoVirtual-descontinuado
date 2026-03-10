from django.db import models

class Roles:
    SUPERADMIN = "superadmin"
    ADMIN = "admin"
    PROFISSIONAL = "profissional"
    CLIENTE = "cliente"


class CargosJudiciais(models.TextChoices):
    JUIZ = "juiz", "Juiz"
    SERVIDOR = "servidor", "Servidor"
    ADVOGADO = "advogado", "Advogado"
    ESTAGIARIO = "estagiario", "Estagiário"
