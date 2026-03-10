from django.apps import AppConfig


class UsuariosConfig(AppConfig):
    # Aqui eu defino a configuração do app para o Django reconhecer o módulo usuarios.
    default_auto_field = "django.db.models.BigAutoField"
    name = "usuarios"
    verbose_name = "Usuários"
