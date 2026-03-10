from typing import Optional

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError as DjangoValidationError

from rest_framework.exceptions import ValidationError, PermissionDenied

from usuarios.serializers.usuario_serializer import (
    UsuarioCreateSerializer,
    UsuarioUpdateSerializer,
)

User = get_user_model()


class UsuarioService:
    """
    Aqui eu concentro todas as regras de negócio relacionadas a usuários.
    As views chamam este service, e ele conversa com o ORM e serializers.
    """

    @staticmethod
    def listar_usuarios(
        status: Optional[str] = None,
        role: Optional[str] = None,
        cartorio_id: Optional[int] = None,
    ):
        """
        Aqui eu retorno um queryset de usuários filtrado.
        Eu deixo a serialização para a view.
        """
        qs = User.objects.all()

        if status:
            qs = qs.filter(status=status)

        if role:
            qs = qs.filter(role=role)

        if cartorio_id:
            qs = qs.filter(cartorio_id=cartorio_id)

        return qs

    @staticmethod
    def criar_usuario(data: dict) -> User:
        """
        Aqui eu crio um novo usuário usando o serializer de criação.
        """
        serializer = UsuarioCreateSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        try:
            user = serializer.save()
        except DjangoValidationError as e:
            # Aqui eu converto erros de modelo em ValidationError do DRF.
            raise ValidationError(e.messages)
        return user

    @staticmethod
    def obter_usuario_por_id(user_id: int) -> User:
        """
        Aqui eu busco um usuário por ID ou levanto 404.
        """
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise ValidationError("Usuário não encontrado.")

    @staticmethod
    def obter_me(user: User) -> User:
        """
        Aqui eu simplesmente retorno o próprio usuário autenticado.
        Eu deixo a lógica separada para eventual expansão futura.
        """
        return user

    @staticmethod
    def alterar_papel(user_id: int, novo_role: str) -> User:
        """
        Aqui eu altero o papel (role) de um usuário.
        A validação de quem PODE fazer isso é feita na permissão da view.
        """
        user = UsuarioService.obter_usuario_por_id(user_id)
        user.role = novo_role
        user.save(update_fields=["role"])
        return user

    @staticmethod
    def alterar_cartorio(user_id: int, cartorio_id: Optional[int]) -> User:
        """
        Aqui eu vinculo/desvinculo o cartório de um usuário.
        """
        user = UsuarioService.obter_usuario_por_id(user_id)
        user.cartorio_id = cartorio_id
        user.save(update_fields=["cartorio_id", "modified_at"])
        return user

    @staticmethod
    def resetar_senha(user_id: int, nova_senha: str) -> User:
        """
        Aqui eu defino uma nova senha para um usuário (uso administrativo).
        """
        if not nova_senha:
            raise ValidationError("Nova senha é obrigatória.")
        user = UsuarioService.obter_usuario_por_id(user_id)
        user.set_password(nova_senha)
        user.save(update_fields=["password", "modified_at"])
        return user

    @staticmethod
    def reativar_usuario(user_id: int) -> User:
        """
        Aqui eu reativo um usuário (caso tenha um status de bloqueio/inativo).
        """
        user = UsuarioService.obter_usuario_por_id(user_id)
        user.is_active = True
        if hasattr(user, "status"):
            user.status = "ativo"
        user.save(update_fields=["is_active", "status", "modified_at"])
        return user

    @staticmethod
    def alterar_cpf(user: User, novo_cpf: str) -> User:
        """
        Aqui eu altero o CPF do próprio usuário autenticado.
        """
        if not novo_cpf:
            raise ValidationError("CPF é obrigatório.")
        user.cpf = novo_cpf
        try:
            user.full_clean()
        except DjangoValidationError as e:
            raise ValidationError(e.messages)
        user.save(update_fields=["cpf", "modified_at"])
        return user

    @staticmethod
    def alterar_senha(user: User, senha_atual: str, nova_senha: str) -> None:
        """
        Aqui eu troco a senha do próprio usuário, garantindo que a senha atual está correta.
        """
        if not senha_atual or not nova_senha:
            raise ValidationError("Senha atual e nova senha são obrigatórias.")

        if not user.check_password(senha_atual):
            raise PermissionDenied("Senha atual incorreta.")

        user.set_password(nova_senha)
        user.save(update_fields=["password", "modified_at"])

    @staticmethod
    def alterar_email(user: User, novo_email: str) -> User:
        """
        Aqui eu altero o e-mail do próprio usuário.
        """
        if not novo_email:
            raise ValidationError("E-mail é obrigatório.")
        user.email = novo_email
        try:
            user.full_clean()
        except DjangoValidationError as e:
            raise ValidationError(e.messages)
        user.save(update_fields=["email", "modified_at"])
        return user

    @staticmethod
    def alterar_telefone(user, telefone):
        raise NotImplementedError("Campo telefone não existe no model User.")
