from django.contrib import admin

from app.models import (
    Municipios,
    TipoCartorio,
    Cartorio,
    Agendamento,
    CategoriaDocumento,
    DocumentoAgendamento,
    Atendimento,
    DocumentoAgendamentoValidacaoHistorico,
    Auditoria,
)


@admin.register(Municipios)
class MunicipiosAdmin(admin.ModelAdmin):
    list_display = ("id", "nome", "uf", "status")
    search_fields = ("nome", "uf", "codigo_ibge")
    list_filter = ("status", "uf")
    ordering = ("nome",)


@admin.register(TipoCartorio)
class TipoCartorioAdmin(admin.ModelAdmin):
    list_display = ("id", "nome", "status")
    search_fields = ("nome",)
    list_filter = ("status",)
    ordering = ("nome",)


@admin.register(Cartorio)
class CartorioAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "nome",
        "cnpj",
        "endereco",
        "municipio",
        "whatsapp",
        "status",
    )
    search_fields = ("nome", "cnpj", "email", "telefone", "whatsapp", "endereco", "bairro", "cep")
    list_filter = ("status", "municipio", "tipo_cartorio")
    ordering = ("nome",)
    readonly_fields = ("criado_em", "atualizado_em")


@admin.register(Agendamento)
class AgendamentoAdmin(admin.ModelAdmin):
    list_display = ("id", "cartorio", "cliente", "profissional", "data_hora", "status", "criado_por")
    list_filter = ("status", "cartorio")
    search_fields = ("cartorio__nome", "cliente__username", "profissional__username")
    readonly_fields = ("criado_em", "atualizado_em")


@admin.register(CategoriaDocumento)
class CategoriaDocumentoAdmin(admin.ModelAdmin):
    list_display = ("id", "nome", "status", "criado_em")
    list_filter = ("status",)
    search_fields = ("nome",)
    readonly_fields = ("criado_em",)


@admin.register(DocumentoAgendamento)
class DocumentoAgendamentoAdmin(admin.ModelAdmin):
    list_display = ("id", "agendamento", "nome", "categoria", "status", "sla_estourado", "criado_em")
    list_filter = ("status", "sla_estourado", "categoria")
    search_fields = ("nome", "agendamento__id")
    readonly_fields = ("criado_em", "validado_em", "prazo_validacao_em", "sla_estourado")


@admin.register(Atendimento)
class AtendimentoAdmin(admin.ModelAdmin):
    list_display = ("id", "cartorio", "status", "usuario", "profissional", "criado_por", "criado_em")
    list_filter = ("status", "cartorio")
    search_fields = ("cartorio__nome", "usuario__username", "profissional__username")
    readonly_fields = ("criado_em", "atualizado_em")


@admin.register(DocumentoAgendamentoValidacaoHistorico)
class DocumentoAgendamentoValidacaoHistoricoAdmin(admin.ModelAdmin):
    list_display = ("id", "documento", "status_anterior", "status_novo", "validado_por", "validado_em")
    list_filter = ("status_anterior", "status_novo")
    readonly_fields = ("validado_em",)


@admin.register(Auditoria)
class AuditoriaAdmin(admin.ModelAdmin):
    list_display = ("id", "tipo_evento", "usuario_executor", "usuario_afetado", "criado_em")
    list_filter = ("tipo_evento",)
    search_fields = ("descricao", "usuario_executor__username", "usuario_afetado__username")
    readonly_fields = ("criado_em",)
