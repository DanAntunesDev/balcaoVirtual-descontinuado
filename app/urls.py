from django.urls import path, include

"""
Este arquivo é o gateway de versões da API do app.

Hoje só existe v1.
Amanhã posso adicionar v2 sem quebrar o frontend.
"""

urlpatterns = [
    path("v1/", include("app.urls.v1.urls")),
]
