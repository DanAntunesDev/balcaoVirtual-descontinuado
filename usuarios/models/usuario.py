from django.contrib.auth.models import AbstractUser
from django.db import models

from usuarios.permissions.roles import CargosJudiciais
from .managers import UserManager


class User(AbstractUser):
    """
    Model de usuário do sistema.
    """

    email = models.EmailField(unique=True)

    class Roles(models.TextChoices):
        SUPERADMIN = "superadmin", "Super Admin"
        ADMIN = "admin", "Admin"
        CARTORIO = "cartorio", "Cartório"
        PROFISSIONAL = "profissional", "Profissional"
        CLIENTE = "cliente", "Cliente"

    role = models.CharField(
        max_length=30,
        choices=Roles.choices,
        default=Roles.CLIENTE,
    )

    cpf = models.CharField(
        max_length=11,
        unique=True,
        null=True,
        blank=True,
    )

    # Meu Perfil
    telefone = models.CharField(max_length=20, null=True, blank=True)

    notificar_email = models.BooleanField(default=True)
    notificar_whatsapp = models.BooleanField(default=False)
    lembrete_automatico_agendamento = models.BooleanField(default=True)

    cargo_judicial = models.CharField(
        max_length=50,
        blank=True,
        null=True,
    )

    cartorio = models.ForeignKey(
        "app.Cartorio",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    cartorios_vinculados = models.ManyToManyField(
        "app.Cartorio",
        blank=True,
        related_name="usuarios_vinculados",
        help_text=(
            "Cartórios adicionais onde o usuário atua/gerencia "
            "(multi-cartório para ADMIN/PROFISSIONAL)."
        ),
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    objects = UserManager()

    class Meta:
        verbose_name = "Usuário"
        verbose_name_plural = "Usuários"

    def __str__(self):
        return self.email

    Role = Roles
    CargoJudicial = CargosJudiciais