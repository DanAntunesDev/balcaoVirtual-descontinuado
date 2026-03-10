from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from app.validators import somente_digitos, validar_cnpj
from usuarios.permissions.cargo_rules import cargo_pode



class StatusAtivo(models.TextChoices):
    ATIVO = "ativo", "Ativo"
    INATIVO = "inativo", "Inativo"
    SUSPENSO = "suspenso", "Suspenso"
    ARQUIVADO = "arquivado", "Arquivado"

class Municipios(models.Model):
    """
    Municípios usados nos cartórios (pode integrar com IBGE depois).
    """

    nome = models.CharField("Nome", max_length=255)
    uf = models.CharField(max_length=2,null=True,blank=True,verbose_name="UF")
    codigo_ibge = models.CharField("Código IBGE", max_length=20, blank=True, null=True)
    status = models.CharField(
    "Status",
    max_length=20,
    choices=StatusAtivo.choices,
    default=StatusAtivo.ATIVO,
)

    class Meta:
        verbose_name = "Município"
        verbose_name_plural = "Municípios"
        ordering = ["nome"]

    def __str__(self) -> str:
        return f"{self.nome} / {self.uf}"


class TipoCartorio(models.Model):
    """
    Tipos de cartório (Registro Civil, Notas, etc)
    """

    nome = models.CharField("Nome", max_length=255, unique=True)
    descricao = models.TextField("Descrição", blank=True, null=True)
    status = models.CharField(
    "Status",
    max_length=20,
    choices=StatusAtivo.choices,
    default=StatusAtivo.ATIVO,
)

    class Meta:
        verbose_name = "Tipo de Cartório"
        verbose_name_plural = "Tipos de Cartório"
        ordering = ["nome"]

    def __str__(self) -> str:
        return self.nome


class Cartorio(models.Model):
    """
    Cartório (central para agendamentos e atendimentos).
    """

    nome = models.CharField("Nome", max_length=255)

    cnpj = models.CharField("CNPJ", max_length=20, blank=True, null=True)
    telefone = models.CharField("Telefone", max_length=20, blank=True, null=True)
    whatsapp = models.CharField("WhatsApp", max_length=20, blank=True, null=True)
    email = models.EmailField("E-mail", blank=True, null=True)

    capacidade_diaria = models.PositiveIntegerField(
        "Capacidade diária",
        default=0,
        help_text="Quantidade máxima de atendimentos por dia",
    )

    abertura = models.TimeField("Horário de abertura", blank=True, null=True)
    fechamento = models.TimeField("Horário de fechamento", blank=True, null=True)

    endereco = models.CharField("Endereço", max_length=255, blank=True, null=True)
    numero = models.CharField("Número", max_length=20, blank=True, null=True)
    complemento = models.CharField("Complemento", max_length=255, blank=True, null=True)
    bairro = models.CharField("Bairro", max_length=255, blank=True, null=True)
    cep = models.CharField("CEP", max_length=20, blank=True, null=True)

    municipio = models.ForeignKey(
        "app.Municipios",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="cartorios",
        verbose_name="Município",
    )

    tipo_cartorio = models.ForeignKey(
        "app.TipoCartorio",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="cartorios",
        verbose_name="Tipo de Cartório",
    )

    criado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="cartorios_criados",
        verbose_name="Criado por",
    )

    status = models.CharField(
    "Status",
    max_length=20,
    choices=StatusAtivo.choices,
    default=StatusAtivo.ATIVO,
)
    criado_em = models.DateTimeField("Criado em", auto_now_add=True)
    atualizado_em = models.DateTimeField("Atualizado em", auto_now=True)

    class Meta:
        verbose_name = "Cartório"
        verbose_name_plural = "Cartórios"
        ordering = ["nome"]

    def clean(self):
        # normaliza
        if self.cnpj:
            cnpj_digits = somente_digitos(self.cnpj)
            if not validar_cnpj(cnpj_digits):
                raise ValidationError({"cnpj": "CNPJ inválido."})
            self.cnpj = cnpj_digits

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.nome


class Agendamento(models.Model):

    class Status(models.TextChoices):
        PENDENTE = "pendente", "Pendente"
        PENDENTE_DOCUMENTOS = "pendente_documentos", "Pendente de Documentos"
        DOCUMENTOS_OK = "documentos_ok", "Documentos OK"
        CONFIRMADO = "confirmado", "Confirmado"
        CANCELADO = "cancelado", "Cancelado"

    cliente = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="agendamentos_cliente",
    )

    profissional = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="agendamentos_profissional",
    )

    cartorio = models.ForeignKey(
        "app.Cartorio",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    data_hora = models.DateTimeField()
    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.PENDENTE,
    )

    observacoes = models.TextField(blank=True, null=True)
    criado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="agendamentos_criados",
    )

    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Agendamento #{self.pk}"
    
    def atualizar_status_por_documentos(self):
        documentos = self.documentos.all()

        if not documentos.exists():
            return

        # Se houver algum reprovado → pendente_documentos
        if documentos.filter(status=DocumentoAgendamento.Status.REPROVADO).exists():
            self.status = self.Status.PENDENTE_DOCUMENTOS
            return

        # Se todos aprovados → documentos_ok
        if not documentos.filter(status=DocumentoAgendamento.Status.PENDENTE).exists():
            self.status = self.Status.DOCUMENTOS_OK
            return

        # Caso contrário mantém pendente_documentos
        self.status = self.Status.PENDENTE_DOCUMENTOS



class CategoriaDocumento(models.Model):
    """
    Categoria de documento (criada pelo SuperAdmin).
    """

    nome = models.CharField("Nome", max_length=255)
    status = models.CharField(
    "Status",
    max_length=20,
    choices=StatusAtivo.choices,
    default=StatusAtivo.ATIVO,
)
    criado_em = models.DateTimeField("Criado em", auto_now_add=True)

    class Meta:
        verbose_name = "Categoria de Documento"
        verbose_name_plural = "Categorias de Documentos"
        ordering = ["nome"]

    def __str__(self) -> str:
        return self.nome


class DocumentoAgendamento(models.Model):
    class Status(models.TextChoices):
        PENDENTE = "pendente", "Pendente"
        APROVADO = "aprovado", "Aprovado"
        REPROVADO = "reprovado", "Reprovado"

    agendamento = models.ForeignKey(
        Agendamento, on_delete=models.CASCADE, related_name="documentos"
    )

    nome = models.CharField(max_length=255, verbose_name="Nome do documento")

    categoria = models.ForeignKey(
        CategoriaDocumento,
        on_delete=models.PROTECT,
        verbose_name="Categoria",
    )

    arquivo = models.FileField(
        upload_to="agendamentos/documentos/",
        verbose_name="Arquivo",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDENTE,
        verbose_name="Status",
    )

    observacao_validacao = models.TextField(
        blank=True, null=True, verbose_name="Observação da validação"
    )

    validado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="documentos_validados",
        verbose_name="Validado por",
    )

    validado_em = models.DateTimeField(null=True, blank=True, verbose_name="Validado em")

    criado_em = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")

    prazo_validacao_em = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name="Prazo máximo para validação",
    )

    sla_estourado = models.BooleanField(default=False, verbose_name="SLA estourado")

    class Meta:
        verbose_name = "Documento do Agendamento"
        verbose_name_plural = "Documentos do Agendamento"
        ordering = ["-criado_em"]

    def save(self, *args, **kwargs):
        # seta prazo automaticamente se não existir
        if self.prazo_validacao_em is None:
            self.prazo_validacao_em = timezone.now() + timezone.timedelta(hours=48)

        # Só recalcula SLA se ele NÃO foi definido manualmente
        if self.status == self.Status.PENDENTE and self.sla_estourado is False:
            self.sla_estourado = timezone.now() > self.prazo_validacao_em

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nome} (Agendamento #{self.agendamento_id})"


class Atendimento(models.Model):
    """
    Atendimento, podendo ou não estar ligado a um agendamento.
    Agora com:
      - profissional (quem atende)
      - criado_por (quem registrou)
    """

    STATUS_CHOICES = (
        ("pendente", "Pendente"),
        ("confirmado", "Confirmado"),
        ("cancelado", "Cancelado"),
    )

    agendamento = models.ForeignKey(
        "app.Agendamento",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="atendimentos",
        verbose_name="Agendamento",
    )

    # quem está “responsável” pelo registro (mantive pra não quebrar código existente)
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="atendimentos",
        verbose_name="Usuário responsável",
    )

    # NOVO: quem efetivamente atende (permite “profissional vê só o dele”)
    profissional = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="atendimentos_profissional",
        verbose_name="Profissional",
    )

    representante = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="atendimentos_representante",
        verbose_name="Representante",
    )

    cartorio = models.ForeignKey(
        "app.Cartorio",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="atendimentos",
        verbose_name="Cartório",
    )

    status = models.CharField(
        "Status",
        max_length=20,
        choices=STATUS_CHOICES,
        default="pendente",
    )

    descricao = models.TextField("Descrição do atendimento", blank=True, null=True)

    criado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="atendimentos_criados",
        verbose_name="Criado por",
    )

    criado_em = models.DateTimeField("Criado em", auto_now_add=True)
    atualizado_em = models.DateTimeField("Atualizado em", auto_now=True)

    class Meta:
        verbose_name = "Atendimento"
        verbose_name_plural = "Atendimentos"
        ordering = ["-criado_em"]

    def save(self, *args, **kwargs):
        # retrocompat: se ninguém setou profissional, assume usuario
        if self.profissional_id is None and self.usuario_id is not None:
            self.profissional_id = self.usuario_id
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"Atendimento #{self.pk} - {self.cartorio}"


class DocumentoAgendamentoValidacaoHistorico(models.Model):
    """
    Histórico imutável de validações de documentos.
    """

    documento = models.ForeignKey(
        DocumentoAgendamento,
        on_delete=models.PROTECT,
        related_name="historico_validacoes",
        verbose_name="Documento",
    )

    status_anterior = models.CharField(max_length=20, verbose_name="Status anterior")
    status_novo = models.CharField(max_length=20, verbose_name="Status novo")

    observacao = models.TextField(blank=True, null=True, verbose_name="Observação da validação")

    validado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="validacoes_documentos",
        verbose_name="Validado por",
    )

    validado_em = models.DateTimeField(auto_now_add=True, verbose_name="Validado em")

    class Meta:
        verbose_name = "Histórico de Validação de Documento"
        verbose_name_plural = "Históricos de Validação de Documento"
        ordering = ["-validado_em"]

    def __str__(self):
        return f"Documento #{self.documento_id} validado em {self.validado_em}"


class AuditoriaQuerySet(models.QuerySet):
    def filter(self, *args, **kwargs):
        if "acao" in kwargs:
            kwargs["tipo_evento"] = kwargs.pop("acao")
        if "usuario" in kwargs:
            kwargs["usuario_executor"] = kwargs.pop("usuario")
        return super().filter(*args, **kwargs)

    def exclude(self, *args, **kwargs):
        if "acao" in kwargs:
            kwargs["tipo_evento"] = kwargs.pop("acao")
        if "usuario" in kwargs:
            kwargs["usuario_executor"] = kwargs.pop("usuario")
        return super().exclude(*args, **kwargs)


class AuditoriaManager(models.Manager):
    def get_queryset(self):
        return AuditoriaQuerySet(self.model, using=self._db)
    

class Auditoria(models.Model):
    """
    Registro de eventos importantes do sistema (auditoria de domínio).
    """

    objects = AuditoriaManager()

    class TipoEvento(models.TextChoices):
        VALIDACAO_DOCUMENTO = "validacao_documento", "Validação de Documento"
        UPLOAD_DOCUMENTO = "upload_documento", "Upload de Documento"
        REENVIO_DOCUMENTO = "reenvio_documento", "Reenvio de Documento"
        VINCULO_CARTORIO = "vinculo_cartorio", "Vínculo de Cartório"
        ALTERACAO_ROLE = "alteracao_role", "Alteração de Papel"
        CRIACAO_USUARIO = "criacao_usuario", "Criação de Usuário"

        # Eventos do Agendamento (precisão)
        CRIACAO_AGENDAMENTO = "criacao_agendamento", "Criação de Agendamento"
        EDICAO_AGENDAMENTO = "edicao_agendamento", "Edição de Agendamento"
        CANCELAMENTO_AGENDAMENTO = "cancelamento_agendamento", "Cancelamento de Agendamento"
        CONFIRMACAO_AGENDAMENTO = "confirmacao_agendamento", "Confirmação de Agendamento"

    tipo_evento = models.CharField(max_length=50, choices=TipoEvento.choices)

    usuario_executor = models.ForeignKey(
        "usuarios.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="auditorias_executadas",
    )

    usuario_afetado = models.ForeignKey(
        "usuarios.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="auditorias_recebidas",
    )

    descricao = models.TextField()

    # Metadata estruturada (ids, payloads úteis, etc)
    metadata = models.JSONField(default=dict, blank=True)

    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Auditoria"
        verbose_name_plural = "Auditorias"
        ordering = ["-criado_em"]

    def __str__(self):
        return f"{self.tipo_evento} - {self.criado_em}"
    @property

    def usuario(self):
        return self.usuario_executor

    @property
    def acao(self):
        return self.tipo_evento