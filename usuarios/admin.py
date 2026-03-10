from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from usuarios.models.usuario import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ("email",)
    list_display = (
        "email",
        "role",
        "cargo_judicial",
        "is_active",
        "is_staff",
    )
    list_filter = (
        "role",
        "cargo_judicial",
        "is_active",
        "is_staff",
    )

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            "Informações de Acesso",
            {
                "fields": (
                    "role",
                    "cargo_judicial",
                    "is_active",
                    "is_staff",
                    "is_superuser",
                )
            },
        ),
        (
            "Permissões",
            {
                "fields": (
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Datas Importantes", {"fields": ("last_login",)}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "password1",
                    "password2",
                    "role",
                    "cargo_judicial",
                    "is_active",
                    "is_staff",
                ),
            },
        ),
    )

    search_fields = ("email",)
