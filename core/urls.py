from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static


def ping(request):
    """
    Endpoint simples de healthcheck.
    Eu uso para saber se o backend está vivo.
    """
    return JsonResponse({"status": "ok", "message": "pong"})


urlpatterns = [
    # Admin Django
    path("admin/", admin.site.urls),

    # Healthcheck
    path("api/ping/", ping, name="ping"),

    # API principal do sistema
    path("api/", include("app.urls")),

    # Módulo de usuários (auth, perfis, papéis)
    path("api/usuarios/", include("usuarios.urls")),

    # Fluxograma (rotas públicas / frontend)
    path("", include("fluxograma.urls")),
]

# Arquivos estáticos e de mídia
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
