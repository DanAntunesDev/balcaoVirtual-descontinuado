from django.conf import settings
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone


def _from_email():
    return (
        getattr(settings, "DEFAULT_FROM_EMAIL", None)
        or getattr(settings, "EMAIL_HOST_USER", None)
        or "no-reply@balcaovirtual.local"
    )


def _send_html_email(subject: str, to: list[str], html: str, text: str = ""):
    if not to:
        return

    msg = EmailMultiAlternatives(
        subject=subject,
        body=text or "",
        from_email=_from_email(),
        to=to,
    )
    msg.attach_alternative(html, "text/html")
    msg.send(fail_silently=True)


# =========================================================
# AGENDAMENTO (fluxo principal legado)
# =========================================================

def enviar_email_agendamento(lista_emails, data_br, hora_atendimento, tipo_html):
    subject = f"Lembrete de atendimento - {data_br} às {hora_atendimento}hrs"

    text = f"""
Olá,

Este é um lembrete da sua reunião agendada para {data_br} às {hora_atendimento}hrs.
""".strip()

    html = f"""
<html>
<body>
    <p>Olá,</p>
    <p>
        Este é um lembrete da sua reunião agendada para
        <strong>{data_br}</strong> às <strong>{hora_atendimento}</strong>.
    </p>
    <p>{tipo_html}</p>
    <p>
        Atenciosamente,<br>
        Balcão Virtual
    </p>
</body>
</html>
""".strip()

    for email in lista_emails:
        if not email:
            continue
        send_mail(
            subject=subject,
            message=text,
            from_email=_from_email(),
            recipient_list=[email],
            fail_silently=False,
            html_message=html,
        )


# =========================================================
# NOVOS EMAILS (produto)
# =========================================================

def enviar_email_boas_vindas(usuario):
    if not getattr(usuario, "email", None):
        return

    user_name = (usuario.get_full_name() or usuario.email or "Usuário").strip()

    html = render_to_string(
        "emails/welcome.html",
        {"user_name": user_name, "email": usuario.email},
    )

    _send_html_email(
        subject="Conta criada com sucesso - Balcão Virtual",
        to=[usuario.email],
        html=html,
        text="Sua conta foi criada com sucesso.",
    )


def enviar_email_codigo_recuperacao(usuario, code: str):
    if not getattr(usuario, "email", None):
        return

    user_name = (usuario.get_full_name() or usuario.email or "Usuário").strip()

    html = render_to_string(
        "emails/password_reset.html",
        {"user_name": user_name, "code": code},
    )

    _send_html_email(
        subject="Recuperação de Senha - Balcão Virtual",
        to=[usuario.email],
        html=html,
        text=f"Seu código de recuperação é: {code}",
    )


def enviar_email_senha_alterada(usuario):
    if not getattr(usuario, "email", None):
        return

    user_name = (usuario.get_full_name() or usuario.email or "Usuário").strip()

    html = render_to_string(
        "emails/password_changed.html",
        {"user_name": user_name, "when": timezone.localtime(timezone.now())},
    )

    _send_html_email(
        subject="Troca de senha efetuada com sucesso - Balcão Virtual",
        to=[usuario.email],
        html=html,
        text="Sua senha foi alterada com sucesso.",
    )


def enviar_email_agendamento_criado(agendamento):
    cliente = getattr(agendamento, "cliente", None)
    if not cliente or not getattr(cliente, "email", None):
        return
    if hasattr(cliente, "notificar_email") and not bool(cliente.notificar_email):
        return

    cartorio = getattr(agendamento, "cartorio", None)
    user_name = (cliente.get_full_name() or cliente.email or "Usuário").strip()

    html = render_to_string(
        "emails/agendamento_criado.html",
        {"user_name": user_name, "ag": agendamento, "cartorio": cartorio},
    )

    _send_html_email(
        subject="Agendamento realizado - Balcão Virtual",
        to=[cliente.email],
        html=html,
        text="Seu agendamento foi criado com sucesso.",
    )


def enviar_email_agendamento_confirmado(agendamento):
    cliente = getattr(agendamento, "cliente", None)
    if not cliente or not getattr(cliente, "email", None):
        return
    if hasattr(cliente, "notificar_email") and not bool(cliente.notificar_email):
        return

    cartorio = getattr(agendamento, "cartorio", None)
    user_name = (cliente.get_full_name() or cliente.email or "Usuário").strip()

    html = render_to_string(
        "emails/agendamento_confirmado.html",
        {"user_name": user_name, "ag": agendamento, "cartorio": cartorio},
    )

    _send_html_email(
        subject="Agendamento confirmado - Balcão Virtual",
        to=[cliente.email],
        html=html,
        text="Seu agendamento foi confirmado.",
    )


def enviar_email_lembrete_agendamento(agendamento):
    cliente = getattr(agendamento, "cliente", None)
    if not cliente or not getattr(cliente, "email", None):
        return

    if hasattr(cliente, "notificar_email") and not bool(cliente.notificar_email):
        return
    if hasattr(cliente, "lembrete_automatico_agendamento") and not bool(cliente.lembrete_automatico_agendamento):
        return

    cartorio = getattr(agendamento, "cartorio", None)
    user_name = (cliente.get_full_name() or cliente.email or "Usuário").strip()

    html = render_to_string(
        "emails/agendamento_lembrete.html",
        {"user_name": user_name, "ag": agendamento, "cartorio": cartorio},
    )

    _send_html_email(
        subject="Lembrete de agendamento - Balcão Virtual",
        to=[cliente.email],
        html=html,
        text="Lembrete: você tem um agendamento em breve.",
    )


# =========================================================
# NOTIFICAÇÕES DE DOMÍNIO (documentos / SLA) — mantidas
# =========================================================

def notificar_documento_reprovado(documento):
    cliente = documento.agendamento.cliente
    if not getattr(cliente, "email", None):
        return

    subject = "Documento reprovado"

    text = f"""
Olá,

O documento "{documento.nome}" foi reprovado.

Motivo:
{documento.observacao_validacao or ""}

Acesse o sistema para reenviar o documento.
""".strip()

    html = f"""
<html>
<body>
    <p>Olá,</p>
    <p>
        O documento <strong>{documento.nome}</strong> foi reprovado.
    </p>
    <p>
        <strong>Motivo:</strong><br>
        {documento.observacao_validacao or ""}
    </p>
    <p>
        Acesse o sistema para reenviar o documento corrigido.
    </p>
    <p>
        Atenciosamente,<br>
        Balcão Virtual
    </p>
</body>
</html>
""".strip()

    send_mail(
        subject=subject,
        message=text,
        from_email=_from_email(),
        recipient_list=[cliente.email],
        fail_silently=True,
        html_message=html,
    )


def notificar_sla_estourado(documento):
    if documento.sla_estourado is not True:
        return

    admin_email = getattr(settings, "DEFAULT_ADMIN_EMAIL", _from_email())

    subject = "SLA de validação de documento estourado"
    text = (
        f"O documento '{documento.nome}' "
        f"(Agendamento #{documento.agendamento_id}) "
        f"ultrapassou o prazo máximo de validação."
    )

    send_mail(
        subject=subject,
        message=text,
        from_email=_from_email(),
        recipient_list=[admin_email],
        fail_silently=True,
    )


def notificar_usuario(usuario, assunto, mensagem):
    if not getattr(usuario, "email", None):
        return

    send_mail(
        subject=assunto,
        message=mensagem,
        from_email=_from_email(),
        recipient_list=[usuario.email],
        fail_silently=True,
    )