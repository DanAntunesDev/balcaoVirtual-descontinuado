"""
Aqui eu concentro a lógica de autenticação usando JWT (SimpleJWT).
Eu centralizo a geração de tokens, garantindo que claims importantes
como 'role' sejam incluídas no payload.
"""

from typing import Dict

from django.contrib.auth import authenticate, get_user_model
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class AutenticacaoService:
    """
    Aqui eu exponho métodos para login, geração de tokens e renovação.
    """

    @staticmethod
    def _gerar_tokens_para_usuario(usuario: User) -> Dict[str, str]:
        """
        Aqui eu gero o par (refresh, access) com claims extras:
        - role
        - email
        - username
        """
        refresh = RefreshToken.for_user(usuario)

        refresh["role"] = getattr(usuario, "role", None) or getattr(usuario, "acesso", None)
        refresh["email"] = usuario.email
        refresh["username"] = usuario.username

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }

    @staticmethod
    def login_unificado(identificador: str, senha: str) -> Dict[str, object]:
        """
        Login unificado:
        - Aceita CPF, email ou username no campo 'identificador'.
        - Valida a senha.
        - Retorna tokens JWT e o usuário autenticado.
        """
        if not identificador or not senha:
            raise ValidationError("É necessário informar identificador e senha.")

        usuario = None

        # 1) Tenta CPF (se houver campo cpf no modelo)
        if hasattr(User, "cpf"):
            cpf_limpado = "".join(filter(str.isdigit, identificador))
            if len(cpf_limpado) == 11:
                try:
                    usuario = User.objects.get(cpf=cpf_limpado)
                except User.DoesNotExist:
                    usuario = None

        # 2) Tenta email
        if usuario is None and "@" in identificador:
            try:
                usuario = User.objects.get(email__iexact=identificador)
            except User.DoesNotExist:
                usuario = None

        # 3) Tenta username
        if usuario is None:
            try:
                usuario = User.objects.get(username__iexact=identificador)
            except User.DoesNotExist:
                usuario = None

        if usuario is None:
            raise AuthenticationFailed("Usuário não encontrado.")

        # Autentico usando EMAIL como USERNAME_FIELD
        usuario_auth = authenticate(username=usuario.email, password=senha)

        if usuario_auth is None:
            raise AuthenticationFailed("Senha inválida.")

        if not usuario_auth.is_active:
            raise AuthenticationFailed("Usuário inativo.")

        tokens = AutenticacaoService._gerar_tokens_para_usuario(usuario_auth)

        return {
            "tokens": tokens,
            "usuario": usuario_auth,
        }
