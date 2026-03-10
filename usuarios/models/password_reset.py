from django.db import models
from django.utils import timezone
from django.conf import settings
from datetime import timedelta


class PasswordResetCode(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="password_reset_codes"
    )

    code = models.CharField(
        max_length=6,
        help_text="Código temporário de verificação"
    )

    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)

    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Código de redefinição de senha"
        verbose_name_plural = "Códigos de redefinição de senha"
        indexes = [
            models.Index(fields=["user", "code"]),
            models.Index(fields=["expires_at"]),
        ]

    def is_expired(self):
        return timezone.now() > self.expires_at

    def mark_used(self):
        self.used_at = timezone.now()
        self.save(update_fields=["used_at"])

    @staticmethod
    def generate_expiration(minutes=10):
        return timezone.now() + timedelta(minutes=minutes)
