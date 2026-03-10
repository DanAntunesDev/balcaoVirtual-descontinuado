import os
from celery import Celery

# Aqui eu defino o settings do Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

app = Celery("core")

# Aqui eu mando o Celery ler as configs do Django
app.config_from_object("django.conf:settings", namespace="CELERY")

# Aqui eu faço o auto-discover das tasks
app.autodiscover_tasks()
