import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

import django

django.setup()

import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone

from app.models import (
    Agendamento,
    Atendimento,
    Cartorio,
    CategoriaDocumento,
    DocumentoAgendamento,
)

User = get_user_model()


@pytest.fixture
def usuario_superadmin(db):
    return User.objects.create_user(
        email="super@admin.com",
        password="123456",
        role="superadmin",
    )


@pytest.fixture
def usuario_admin(db):
    return User.objects.create_user(
        email="admin@test.com",
        password="123456",
        role="admin",
    )


@pytest.fixture
def usuario_cliente(db):
    return User.objects.create_user(
        email="cliente@test.com",
        password="123456",
        role="cliente",
    )


@pytest.fixture
def usuario_profissional(db):
    return User.objects.create_user(
        email="prof@test.com",
        password="123456",
        role="profissional",
        cargo_judicial="escrevente",
    )


@pytest.fixture
def cartorio(db):
    return Cartorio.objects.create(
        nome="Cartório Teste"
    )


@pytest.fixture
def categoria_documento(db):
    return CategoriaDocumento.objects.create(
        nome="Categoria Teste"
    )


@pytest.fixture
def agendamento_cliente(db, usuario_cliente, cartorio):
    return Agendamento.objects.create(
        cliente=usuario_cliente,
        cartorio=cartorio,
        data_hora=timezone.now(),
        status=Agendamento.Status.PENDENTE,
    )


@pytest.fixture
def agendamento_profissional(db, usuario_profissional, cartorio):
    return Agendamento.objects.create(
        cliente=usuario_profissional,
        profissional=usuario_profissional,
        cartorio=cartorio,
        data_hora=timezone.now(),
        status=Agendamento.Status.PENDENTE,
    )


@pytest.fixture
def atendimento_cliente(
    db,
    agendamento_cliente,
    usuario_cliente,
    usuario_profissional,
    cartorio,
):
    return Atendimento.objects.create(
        agendamento=agendamento_cliente,
        usuario=usuario_cliente,
        profissional=usuario_profissional,
        cartorio=cartorio,
        status="pendente",
    )


@pytest.fixture
def documento_reprovado(
    db,
    agendamento_cliente,
    categoria_documento,
):
    return DocumentoAgendamento.objects.create(
        agendamento=agendamento_cliente,
        categoria=categoria_documento,
        nome="Documento Teste",
        arquivo="teste.pdf",
        status=DocumentoAgendamento.Status.REPROVADO,
        sla_estourado=False,
    )


@pytest.fixture
def documento_sla_estourado(
    db,
    agendamento_cliente,
    categoria_documento,
):
    return DocumentoAgendamento.objects.create(
        agendamento=agendamento_cliente,
        categoria=categoria_documento,
        nome="Documento SLA",
        arquivo="teste_sla.pdf",
        status=DocumentoAgendamento.Status.PENDENTE,
        sla_estourado=True,
    )


@pytest.fixture
def agendamento_com_documentos_aprovados(
    db,
    agendamento_cliente,
    categoria_documento,
):
    DocumentoAgendamento.objects.create(
        agendamento=agendamento_cliente,
        categoria=categoria_documento,
        nome="Doc 1",
        arquivo="doc1.pdf",
        status=DocumentoAgendamento.Status.APROVADO,
    )

    DocumentoAgendamento.objects.create(
        agendamento=agendamento_cliente,
        categoria=categoria_documento,
        nome="Doc 2",
        arquivo="doc2.pdf",
        status=DocumentoAgendamento.Status.APROVADO,
    )

    return agendamento_cliente