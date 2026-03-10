from django.views.decorators.csrf import csrf_exempt

def disable_csrf(view):
    return csrf_exempt(view)
