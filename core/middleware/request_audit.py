from django.utils.timezone import now
from app.models import Auditoria


class RequestAuditMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if request.user.is_authenticated and request.method in ["POST", "PUT", "PATCH", "DELETE"]:
            try:
                Auditoria.objects.create(
                    tipo_evento=Auditoria.TipoEvento.ALTERACAO_ROLE,
                    usuario_executor=request.user,
                    descricao=f"{request.method} {request.path}",
                )
            except Exception:
                pass

        return response
