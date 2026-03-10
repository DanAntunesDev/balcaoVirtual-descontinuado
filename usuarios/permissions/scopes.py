from enum import StrEnum


class Scopes(StrEnum):
    # Modelo novo (granular)
    USUARIO_LISTAR = "usuario:listar"
    USUARIO_VER = "usuario:ver"
    USUARIO_CRIAR = "usuario:criar"
    USUARIO_EDITAR = "usuario:editar"
    USUARIO_DESATIVAR = "usuario:desativar"

    AGENDAMENTO_GERIR = "agendamento:gerir"

    DOCUMENTO_VALIDAR = "documento:validar"
    DOCUMENTO_REENVIAR = "documento:reenviar"
    DOCUMENTO_UPLOAD = "documento:upload"

    AUDITORIA_VER = "auditoria:ver"
    RELATORIO_VER = "relatorio:ver"

    # Compatibilidade com testes e chamadas legadas
    USUARIOS = "usuarios"
    DOCUMENTOS = "documentos"
    AUDITORIA = "auditoria"
    RELATORIOS = "relatorios"
    AGENDAMENTOS = "agendamentos"


class Actions(StrEnum):
    LIST = "list"
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"


Actions = Actions