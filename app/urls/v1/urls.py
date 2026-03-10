from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter

from app.views.agendamento_viewset import AgendamentoViewSet
from app.views.documento_agendamento_viewset import DocumentoAgendamentoViewSet
from app.views.atendimento_viewset import AtendimentoViewSet

# ADMIN
from app.views.cartorio_viewset import CartorioViewSet
from app.views.municipio_viewset import MunicipioViewSet
from app.views.tipo_cartorio_viewset import TipoCartorioViewSet

# FRONTEND
from app.views.cartorio_frontend_viewset import CartorioFrontendViewSet
from app.views.dashboard_viewset import DashboardViewSet
from app.views.historico_cliente_viewset import HistoricoClienteViewSet
from app.views.auditoria_viewset import AuditoriaViewSet
from app.views.relatorios_admin_viewset import RelatoriosAdminViewSet
from app.views.relatorios_profissionais_viewset import (
    RelatoriosProfissionaisViewSet,
)
from app.views.profissional_escopo_view import ProfissionalEscopoView

# PÚBLICO
from app.views.cartorio_publico_view import listar_cartorios

# NOVO: categorias de documentos (tags)
from app.views.categoria_documento_viewset import CategoriaDocumentoViewSet


# Router principal da API v1
router = DefaultRouter()

# ADMIN – rotas administrativas
router.register("admin/cartorios", CartorioViewSet, basename="admin-cartorio")

# FRONTEND – contrato estável
router.register("cartorios", CartorioFrontendViewSet, basename="frontend-cartorios")

# Recursos principais
router.register("municipios", MunicipioViewSet, basename="municipio")
router.register("tipos-cartorio", TipoCartorioViewSet, basename="tipo-cartorio")
router.register("agendamentos", AgendamentoViewSet, basename="agendamento")
router.register("atendimentos", AtendimentoViewSet, basename="atendimento")

# NOVO: categorias de documentos para o frontend
router.register("documentos/categorias", CategoriaDocumentoViewSet, basename="documentos-categorias")

# Dashboards e históricos
router.register("dashboard", DashboardViewSet, basename="dashboard")
router.register(
    "cliente/historico",
    HistoricoClienteViewSet,
    basename="cliente-historico",
)

# Auditoria e relatórios
router.register("auditorias", AuditoriaViewSet, basename="auditoria")
router.register(
    "relatorios/profissionais",
    RelatoriosProfissionaisViewSet,
    basename="relatorios-profissionais",
)

# Router aninhado
# /agendamentos/{agendamento_id}/documentos/
agendamentos_router = NestedDefaultRouter(
    router,
    "agendamentos",
    lookup="agendamento",
)

agendamentos_router.register(
    "documentos",
    DocumentoAgendamentoViewSet,
    basename="agendamento-documentos",
)

# Relatório administrativo específico
relatorios_admin = RelatoriosAdminViewSet.as_view({
    "get": "documentos",
})

urlpatterns = [
    path("", include(router.urls)),
    path("", include(agendamentos_router.urls)),
    path("admin/relatorios/documentos/", relatorios_admin, name="relatorio-documentos-admin"),
    path("profissional/me/escopo/", ProfissionalEscopoView.as_view(), name="profissional-escopo"),

    # Público (sem autenticação)
    path("public/cartorios/", listar_cartorios, name="cartorios-publicos"),
]