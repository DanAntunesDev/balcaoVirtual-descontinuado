# usuarios/models/__init__.py

# Aqui eu exponho o model User no pacote usuarios.models
# para evitar imports quebrando em outros módulos.
from .usuario import User  # noqa: F401
from .password_reset import PasswordResetCode