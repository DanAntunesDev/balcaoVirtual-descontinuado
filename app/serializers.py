from django.contrib.auth import get_user_model
from rest_framework import serializers

from app.models import (
    Cartorio,
    Atendimento,
    Municipios,
    Agendamento,
    DocumentoAgendamento,
    TipoCartorio,
)
from app.models import DocumentoAgendamento
from app.models import Auditoria

User = get_user_model()

# SERIALIZERS EXISTENTES

class CartorioSerializer(serializers.ModelSerializer):
    """
    Serializer administrativo de Cartório.
    Mantido intacto para não quebrar fluxos antigos.
    """

    tipo_display = serializers.SerializerMethodField()

    class Meta:
        model = Cartorio
        fields = "__all__"
        read_only_fields = ["id"]

    def get_tipo_display(self, obj):
        try:
            return obj.get_tipo_display()
        except Exception:
            try:
                return obj.tipo_cartorio.nome
            except Exception:
                return None


class AtendimentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Atendimento
        fields = "__all__"


class MunicipiosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Municipios
        fields = "__all__"


class TipoCartorioSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoCartorio
        fields = "__all__"



# AGENDAMENTO



class DocumentoAgendamentoSerializer(serializers.ModelSerializer):
    """
    Serializer legado (mantido por compatibilidade).
    NÃO usar para criação.
    """

    class Meta:
        model = DocumentoAgendamento
        fields = [
            "id",
            "nome",
            "categoria",
            "arquivo",
            "criado_em",
        ]


class AgendamentoSerializer(serializers.ModelSerializer):
    # Cliente pode criar sem enviar `cliente` (backend força request.user)
    cliente = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True,
    )

    cliente_nome = serializers.CharField(
        source="cliente.get_full_name",
        read_only=True,
    )

    profissional_nome = serializers.CharField(
        source="profissional.get_full_name",
        read_only=True,
    )

    cartorio_nome = serializers.CharField(
        source="cartorio.nome",
        read_only=True,
    )

    documentos = DocumentoAgendamentoSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Agendamento
        fields = [
            "id",
            "cliente",
            "cliente_nome",
            "profissional",
            "profissional_nome",
            "cartorio",
            "cartorio_nome",
            "data_hora",
            "status",
            "observacoes",
            "documentos",
            "criado_por",
            "criado_em",
            "atualizado_em",
        ]
        read_only_fields = ["criado_por", "criado_em", "atualizado_em"]


    def validate(self, attrs):
        request = self.context.get("request") if hasattr(self, "context") else None
        user = getattr(request, "user", None) if request else None
        role = str(getattr(user, "role", "") or "").lower() if user else ""

        is_create = self.instance is None

        # Regras de criação (contrato do frontend):
        # - Cliente não precisa enviar `cliente` e não pode criar para terceiros.
        # - Para outras roles, `cliente` deve ser informado (quando criando via backoffice/API).
        if is_create:
            if role == "cliente":
                if "cliente" in attrs and attrs.get("cliente") and attrs["cliente"].id != user.id:
                    raise serializers.ValidationError({"cliente": "Cliente inválido."})
                attrs["cliente"] = user
            else:
                if "cliente" not in attrs or attrs.get("cliente") is None:
                    raise serializers.ValidationError({"cliente": "Campo obrigatório."})

            # Para o fluxo de Cartórios, cartório é obrigatório
            if not attrs.get("cartorio"):
                raise serializers.ValidationError({"cartorio": "Cartório é obrigatório."})

        # valida status dentro do enum do model
        if "status" in attrs:
            allowed = [c[0] for c in Agendamento.Status.choices]
            if attrs["status"] not in allowed:
                raise serializers.ValidationError({"status": "Status inválido."})

        return attrs



# CARTÓRIO – FRONTEND

class MunicipioInlineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Municipios
        fields = ["id", "nome"]


class TipoCartorioInlineSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoCartorio
        fields = ["id", "nome"]


class CartorioFrontendSerializer(serializers.ModelSerializer):
    # leitura (GET)
    municipio = MunicipioInlineSerializer(read_only=True)
    tipo = TipoCartorioInlineSerializer(
        source="tipo_cartorio",
        read_only=True,
    )

    # escrita (PUT / POST)
    municipio_id = serializers.PrimaryKeyRelatedField(
        source="municipio",
        queryset=Municipios.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
    )

    tipo_id = serializers.PrimaryKeyRelatedField(
        source="tipo_cartorio",
        queryset=TipoCartorio.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Cartorio
        fields = [
            "id",
            "nome",

            # leitura
            "municipio",
            "tipo",

            # escrita
            "municipio_id",
            "tipo_id",

            # dados gerais
            "endereco",
            "numero",
            "cep",
            "telefone",
            "whatsapp",
            "email",
            "capacidade_diaria",
            "abertura",
            "fechamento",
            "status",
        ]



class CartorioPublicoSerializer(serializers.ModelSerializer):
    """Serializer público (sem autenticação).

    Contrato para o frontend público/cliente:
    - expõe dados necessários para card + modais
    - não vaza campos administrativos
    """

    cidade = serializers.SerializerMethodField()
    estado = serializers.SerializerMethodField()
    endereco = serializers.SerializerMethodField()
    horario = serializers.SerializerMethodField()
    tipo = serializers.SerializerMethodField()

    class Meta:
        model = Cartorio
        fields = [
            "id",
            "nome",
            "cidade",
            "estado",
            "endereco",
            "telefone",
            "horario",
            "status",
            "tipo",
        ]

    def get_cidade(self, obj):
        return getattr(getattr(obj, "municipio", None), "nome", None)

    def get_estado(self, obj):
        return getattr(getattr(obj, "municipio", None), "uf", None)

    def get_endereco(self, obj):
        partes = []
        if getattr(obj, "endereco", None):
            partes.append(obj.endereco)
        if getattr(obj, "numero", None):
            partes.append(str(obj.numero))
        if getattr(obj, "bairro", None):
            partes.append(obj.bairro)
        if getattr(obj, "complemento", None):
            partes.append(obj.complemento)
        if getattr(obj, "cep", None):
            partes.append(f"CEP {obj.cep}")
        return ", ".join([p for p in partes if p]) or None

    def get_horario(self, obj):
        abertura = getattr(obj, "abertura", None)
        fechamento = getattr(obj, "fechamento", None)

        if abertura and fechamento:
            return f"{abertura.strftime('%H:%M')} - {fechamento.strftime('%H:%M')}"
        if abertura:
            return f"A partir de {abertura.strftime('%H:%M')}"
        if fechamento:
            return f"Até {fechamento.strftime('%H:%M')}"
        return None

    def get_tipo(self, obj):
        tipo = getattr(obj, "tipo_cartorio", None)
        if not tipo:
            return None
        return {
            "id": tipo.id,
            "nome": tipo.nome,
        }




# DOCUMENTOS DO AGENDAMENTO

class DocumentoAgendamentoReadSerializer(serializers.ModelSerializer):
    categoria = serializers.StringRelatedField()
    validado_por = serializers.StringRelatedField()

    class Meta:
        model = DocumentoAgendamento
        fields = [
            "id",
            "nome",
            "categoria",
            "arquivo",
            "status",
            "observacao_validacao",
            "validado_por",
            "validado_em",
            "criado_em",
        ]

class DocumentoAgendamentoWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentoAgendamento
        fields = ["nome", "categoria", "arquivo"]

    def validate_arquivo(self, value):
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError(
                "Arquivo não pode exceder 5MB."
            )
        return value

class DocumentoAgendamentoValidacaoSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=DocumentoAgendamento.Status.choices
    )
    observacao_validacao = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True
    )

    def validate(self, data):
        status = data.get("status")
        observacao = data.get("observacao_validacao")

        if (
            status == DocumentoAgendamento.Status.REPROVADO
            and not observacao
        ):
            raise serializers.ValidationError({
                "observacao_validacao": (
                    "Obrigatória quando o documento for reprovado."
                )
            })

        return data

class DocumentosAdminReportSerializer(serializers.Serializer):
    """
    Serializer de saída para relatório administrativo de documentos.
    """

    total_documentos = serializers.IntegerField()
    pendentes = serializers.IntegerField()
    aprovados = serializers.IntegerField()
    reprovados = serializers.IntegerField()
    sla_estourado = serializers.IntegerField()
    tempo_medio_validacao = serializers.DurationField(allow_null=True)
    
class HistoricoClienteSerializer(serializers.Serializer):
    """
    Serializer responsável por expor o histórico do cliente.
    """

    agendamentos = serializers.SerializerMethodField()
    atendimentos = serializers.SerializerMethodField()
    documentos = serializers.SerializerMethodField()

    def get_agendamentos(self, obj):
        from app.serializers import AgendamentoSerializer
        return AgendamentoSerializer(
            obj["agendamentos"],
            many=True,
        ).data

    def get_atendimentos(self, obj):
        from app.serializers import AtendimentoSerializer
        return AtendimentoSerializer(
            obj["atendimentos"],
            many=True,
        ).data

    def get_documentos(self, obj):
        from app.serializers import DocumentoAgendamentoReadSerializer
        return DocumentoAgendamentoReadSerializer(
            obj["documentos"],
            many=True,
        ).data
        
    
class AuditoriaSerializer(serializers.ModelSerializer):
    """
    Serializer responsável por expor auditorias do sistema.

    Aqui eu:
    - exponho dados essenciais
    - não permito escrita
    """

    usuario_executor_email = serializers.EmailField(
        source="usuario_executor.email",
        read_only=True,
        default=None,
    )

    usuario_afetado_email = serializers.EmailField(
        source="usuario_afetado.email",
        read_only=True,
        default=None,
    )

    class Meta:
        model = Auditoria
        fields = [
            "id",
            "tipo_evento",
            "descricao",
            "usuario_executor_email",
            "usuario_afetado_email",
            "criado_em",
        ]
        read_only_fields = fields
        
class DashboardCardSerializer(serializers.Serializer):
    key = serializers.CharField()
    label = serializers.CharField()
    total = serializers.IntegerField()


class DashboardResumoStatusSerializer(serializers.Serializer):
    status = serializers.CharField()
    total = serializers.IntegerField()


class DashboardResumoSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    por_status = DashboardResumoStatusSerializer(many=True)


class DashboardSerializer(serializers.Serializer):
    cards = DashboardCardSerializer(many=True)
    agendamentos = DashboardResumoSerializer()
    atendimentos = DashboardResumoSerializer()
    documentos = DashboardResumoSerializer()