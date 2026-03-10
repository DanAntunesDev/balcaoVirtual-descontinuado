from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.decorators import action
from rest_framework.parsers import JSONParser, FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from app.models import DocumentoAgendamento, Agendamento, Auditoria
from app.serializers import (
    DocumentoAgendamentoReadSerializer,
    DocumentoAgendamentoWriteSerializer,
    DocumentoAgendamentoValidacaoSerializer,
)
from app.services.agendamento.documento_reenvio_service import reenviar_documento
from app.services.agendamento.documento_validacao_service import validar_documento
from app.services.auditoria_service import AuditoriaService
from app.permissions.documento_upload_permission import PodeEnviarDocumento
from app.permissions.documento_reenvio_permission import PodeReenviarDocumento
from app.permissions.documento_validacao_permission import PodeValidarDocumento


class DocumentoAgendamentoViewSet(ModelViewSet):
    parser_classes = [JSONParser, FormParser, MultiPartParser]
    permission_classes = [IsAuthenticated]
    queryset = DocumentoAgendamento.objects.none()

    def _role(self):
        return str(getattr(self.request.user, "role", "")).lower()

    def _nested_agendamento_id(self):
        # nested router: /agendamentos/{agendamento_pk}/documentos/
        return self.kwargs.get("agendamento_pk") or self.kwargs.get("agendamento_id")

    def get_queryset(self):
        user = self.request.user
        role = self._role()

        base = (
            DocumentoAgendamento.objects
            .select_related("agendamento", "categoria")
            .order_by("-id")
        )

        # filtra pelo agendamento se vier via nested
        nested_id = self._nested_agendamento_id()
        if nested_id:
            base = base.filter(agendamento_id=nested_id)

        if role == "superadmin" or user.is_superuser:
            return base

        if role == "cliente":
            return base.filter(agendamento__cliente=user)

        if role in {"profissional", "profissional_judicial", "juiz"}:
            return base.filter(agendamento__profissional=user)

        if role in {"admin", "cartorio"}:
            if not getattr(user, "cartorio_id", None):
                return DocumentoAgendamento.objects.none()
            return base.filter(agendamento__cartorio_id=user.cartorio_id)

        return DocumentoAgendamento.objects.none()

    def get_object(self):
        return get_object_or_404(self.get_queryset(), pk=self.kwargs["pk"])

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return DocumentoAgendamentoWriteSerializer
        if self.action == "validar":
            return DocumentoAgendamentoValidacaoSerializer
        return DocumentoAgendamentoReadSerializer

    def get_permissions(self):
        if self.action == "create":
            return [IsAuthenticated(), PodeEnviarDocumento()]
        if self.action == "reenviar":
            return [IsAuthenticated(), PodeReenviarDocumento()]
        if self.action == "validar":
            return [IsAuthenticated(), PodeValidarDocumento()]
        return super().get_permissions()

    @transaction.atomic
    def perform_create(self, serializer):
        # 1) tenta pegar pelo nested URL
        nested_id = self._nested_agendamento_id()

        # 2) fallback: body
        body_id = self.request.data.get("agendamento_id")

        agendamento_id = nested_id or body_id

        if not agendamento_id:
            raise ValueError("agendamento_id é obrigatório (via URL ou body).")

        agendamento = get_object_or_404(
            Agendamento.objects.select_related("cliente"),
            pk=agendamento_id,
        )

        documento = serializer.save(agendamento=agendamento)

        AuditoriaService.registrar_evento(
            tipo_evento=Auditoria.TipoEvento.UPLOAD_DOCUMENTO,
            usuario_executor=self.request.user,
            usuario_afetado=agendamento.cliente,
            descricao=f"Upload de documento '{documento.nome}' para agendamento #{agendamento.pk}.",
        )

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def reenviar(self, request, pk=None):
        documento_original = self.get_object()
        arquivo = request.FILES.get("arquivo")

        if not arquivo:
            return Response(
                {"detail": "Arquivo é obrigatório."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        doc = reenviar_documento(
            documento_original=documento_original,
            novo_arquivo=arquivo,
            usuario=request.user,
        )

        return Response(
            DocumentoAgendamentoReadSerializer(doc).data
        )

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def validar(self, request, pk=None):
        documento = self.get_object()

        serializer = DocumentoAgendamentoValidacaoSerializer(
            data=request.data
        )
        serializer.is_valid(raise_exception=True)

        doc = validar_documento(
            documento=documento,
            status=serializer.validated_data["status"],
            observacao_validacao=serializer.validated_data.get("observacao_validacao") or "",
            usuario=request.user,
        )

        return Response(
            DocumentoAgendamentoReadSerializer(doc).data
        )