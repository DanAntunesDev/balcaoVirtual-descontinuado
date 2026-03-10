from django.contrib.auth.base_user import BaseUserManager


class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, *args, **kwargs):
        """
        Compatível com:
        - create_user(username, email, password, role=...)
        - create_user(email=..., password=..., role=...)
        """

        username = None
        email = None
        password = None

        # --- chamada posicional ---
        if args:
            if len(args) == 3:
                username, email, password = args
            elif len(args) == 2:
                email, password = args
            elif len(args) == 1:
                email = args[0]

        # --- chamada nomeada ---
        username = kwargs.pop("username", username)
        email = kwargs.pop("email", email)
        password = kwargs.pop("password", password)

        if not email:
            raise ValueError("Email é obrigatório.")

        email = self.normalize_email(email).lower()

        # se username não vier, usa parte antes do @
        if not username:
            username = email.split("@")[0]

        user = self.model(
            username=username,
            email=email,
            **kwargs,
        )

        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()

        user.is_active = True
        user.save(using=self._db)
        return user

    def create_superuser(self, username=None, email=None, password=None, **extra_fields):
        extra_fields.setdefault("role", "superadmin")
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_staff", True)

        return self.create_user(
            username=username,
            email=email,
            password=password,
            **extra_fields,
        )
