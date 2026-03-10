import secrets
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from usuarios.models import PasswordResetCode, User


def _only_digits(value: str) -> str:
    return "".join(ch for ch in str(value or "") if ch.isdigit())


class PasswordResetService:
    @staticmethod
    def _generate_code(length=6):
        alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
        return "".join(secrets.choice(alphabet) for _ in range(length))

    @staticmethod
    def _find_user(*, cpf=None, email=None, identifier=None, require_active=True):
        raw_email = (email or "").strip().lower()
        raw_cpf = _only_digits(cpf)

        if identifier:
            identifier = str(identifier).strip()
            if "@" in identifier and not raw_email:
                raw_email = identifier.lower()
            elif not raw_cpf:
                raw_cpf = _only_digits(identifier)

        filters = {}
        if require_active:
            filters["is_active"] = True

        if raw_email and raw_cpf:
            return User.objects.filter(
                email__iexact=raw_email,
                cpf=raw_cpf,
                **filters,
            ).first()

        if raw_email:
            return User.objects.filter(
                email__iexact=raw_email,
                **filters,
            ).first()

        if raw_cpf:
            return User.objects.filter(
                cpf=raw_cpf,
                **filters,
            ).first()

        return None

    @staticmethod
    def request_reset(cpf=None, email=None, ip=None, user_agent=None, identifier=None):
        user = PasswordResetService._find_user(
            cpf=cpf,
            email=email,
            identifier=identifier,
            require_active=True,
        )

        if user is None:
            return

        PasswordResetCode.objects.filter(
            user=user,
            used_at__isnull=True,
        ).update(used_at=timezone.now())

        code = PasswordResetService._generate_code(6)

        PasswordResetCode.objects.create(
            user=user,
            code=code,
            expires_at=PasswordResetCode.generate_expiration(),
            ip_address=ip,
            user_agent=user_agent,
        )

        user_name = (user.get_full_name() or user.email or "Usuário").strip()

        html_content = render_to_string(
            "emails/password_reset.html",
            {
                "user_name": user_name,
                "code": code,
            },
        )

        from_email = (
            getattr(settings, "DEFAULT_FROM_EMAIL", None)
            or getattr(settings, "EMAIL_HOST_USER", None)
        )

        email_msg = EmailMultiAlternatives(
            subject="Recuperação de Senha - Balcão Virtual",
            body=f"Seu código de recuperação é: {code}",
            from_email=from_email,
            to=[user.email],
        )
        email_msg.attach_alternative(html_content, "text/html")
        email_msg.send(fail_silently=True)

    @staticmethod
    def validate_code(identifier=None, code=None, *, cpf=None, email=None):
        code = (code or "").strip().upper()
        if not code:
            raise ValidationError("Código inválido ou expirado.")

        user = PasswordResetService._find_user(
            cpf=cpf,
            email=email,
            identifier=identifier,
            require_active=True,
        )
        if user is None:
            raise ValidationError("Código inválido ou expirado.")

        reset = (
            PasswordResetCode.objects.select_related("user")
            .filter(
                user=user,
                code=code,
                used_at__isnull=True,
            )
            .order_by("-created_at")
            .first()
        )

        if reset is None:
            raise ValidationError("Código inválido ou expirado.")

        if reset.is_expired():
            raise ValidationError("Código expirado.")

        return reset