from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from usuarios.views.autenticacao_view import LoginView
from usuarios.views.usuario_me import UsuarioMeView, UsuarioAlterarSenhaView, UsuarioExcluirContaView
from usuarios.views.register_view import RegisterView
from usuarios.views.password_views import (
    PasswordRequestView,
    PasswordCodeLoginView,
    PasswordResetView,
)

from usuarios.views.usuario_view import UsuarioViewSet


router = DefaultRouter()
router.register("v1/usuarios", UsuarioViewSet, basename="usuarios")


urlpatterns = [
    path("v1/login/", LoginView.as_view(), name="login"),

    path("v1/me/", UsuarioMeView.as_view(), name="usuario_me"),
    path("v1/me/alterar-senha/", UsuarioAlterarSenhaView.as_view(), name="usuario_me_alterar_senha"),
    path("v1/me/excluir-conta/", UsuarioExcluirContaView.as_view(), name="usuario_me_excluir_conta"),

    path("v1/register/", RegisterView.as_view(), name="register"),

    path("v1/password/request/", PasswordRequestView.as_view()),
    path("v1/password/code-login/", PasswordCodeLoginView.as_view()),
    path("v1/password/reset/", PasswordResetView.as_view()),

    path("v1/token/refresh/", TokenRefreshView.as_view()),

    path("", include(router.urls)),
]