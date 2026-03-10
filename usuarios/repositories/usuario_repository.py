from django.contrib.auth import get_user_model

User = get_user_model()


class UsuarioRepository:

    def filtrar(self, **filters):
        return User.objects.filter(**filters)

    def listar_por_cartorio(self, cartorio_id):
        return User.objects.filter(cartorio_id=cartorio_id)

    def desativar(self, user_id):
        user = User.objects.get(id=user_id)
        user.is_active = False
        user.save(update_fields=["is_active"])
        return user
