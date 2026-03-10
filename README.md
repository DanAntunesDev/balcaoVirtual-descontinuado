# Balcão Virtual

Repositório de um sistema de atendimento e agendamento para cartórios, com backend em Django REST Framework e frontend em React/Vite.

Este projeto foi descontinuado antes de uma consolidação final. O objetivo deste repositório é documentar de forma honesta o estado funcional alcançado e preservar a evolução técnica do código. A base principal que permanece válida hoje é:

- API Django para autenticação, usuários, cartórios, agendamentos, documentos, auditoria e dashboards
- Frontend React/Vite para fluxo público, autenticação, área do cliente e área administrativa inicial
- Serviços de notificação por e-mail e tarefas assíncronas relacionadas a agendamento e validação de documentos

## Estado atual

O runtime principal do projeto está concentrado em:

- `core/`
- `app/`
- `usuarios/`
- `frontend/`

Existem diretórios e arquivos legados no snapshot do projeto, principalmente código antigo de templates Django, seeds antigas, artefatos de ambiente local e listagens exportadas da árvore de arquivos. Eles não representam o contrato principal da aplicação e precisam ser tratados como limpeza de publicação.

## Stack identificada

### Backend

- Python 3.12+
- Django
- Django REST Framework
- SimpleJWT
- Celery
- Redis
- WeasyPrint
- pytest

### Frontend

- React
- Vite
- React Router
- Axios
- Tailwind CSS
- Sonner
- Framer Motion

## Estrutura principal

```text
.
├── app/         # domínio de cartórios, agendamentos, documentos, dashboards e auditoria
├── core/        # configuração Django, URLs e bootstrap
├── usuarios/    # autenticação, perfil, permissões e recuperação de senha
├── frontend/    # SPA React/Vite
├── Dockerfile
├── docker-compose.yml
└── requirements.txt
```

## Requisitos

- Python 3.12+
- Node.js 22+
- npm 10+
- Redis, caso queira testar Celery fora do modo síncrono
- PostgreSQL apenas se optar por usar banco externo; o projeto também suporta SQLite para desenvolvimento local

## Backend

Para rodar o backend localmente, o projeto usa `requirements.txt`, variáveis de ambiente em `.env` e migrações Django padrão.

Fluxo esperado de setup local:

```bash
python -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py runserver
```

A API local fica disponível em:

- `http://127.0.0.1:8000/api/`

Healthcheck:

- `http://127.0.0.1:8000/api/ping/`

## Frontend

O frontend está dentro de `frontend/` e depende do backend Django disponível em `/api`.

Fluxo esperado de setup local:

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Por padrão, a base local esperada é:

- `http://127.0.0.1:8000/api`

## Docker

O `Dockerfile` e o `docker-compose.yml` deste repositório estão preparados apenas para o backend e o worker Celery. O frontend continua com fluxo próprio via Vite.

Subida local do backend com Redis:

```bash
docker compose up --build
```

## Observações importantes para publicação

- Não publique `.env`, bancos locais, `node_modules`, `venv`, artefatos de cobertura e dumps de árvore
- Há código legado no repositório que não representa o runtime principal atual
- A publicação pública ideal deve manter apenas o que participa do backend atual, do frontend atual e da documentação coerente com isso
- O projeto não deve ser apresentado como sistema finalizado em produção
- O estado correto é de base funcional avançada, porém descontinuada antes do acabamento final

## Licença

Defina a licença no momento da publicação pública. Este snapshot não inclui licença consolidada.
