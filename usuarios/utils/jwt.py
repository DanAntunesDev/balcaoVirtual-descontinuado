from rest_framework_simplejwt.tokens import AccessToken


def generate_password_reset_token(user):
    token = AccessToken.for_user(user)
    token["scope"] = "password_reset"
    token.set_exp(lifetime=300)
    return str(token)
