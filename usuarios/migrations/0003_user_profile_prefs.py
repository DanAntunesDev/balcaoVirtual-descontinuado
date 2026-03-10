from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("usuarios", "0002_alter_user_cartorio"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="telefone",
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AddField(
            model_name="user",
            name="notificar_email",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="user",
            name="notificar_whatsapp",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="user",
            name="lembrete_automatico_agendamento",
            field=models.BooleanField(default=True),
        ),
    ]