# Balcão Virtual (Projeto Descontinuado)

Plataforma de atendimento e agendamento desenvolvida para cartórios, permitindo organizar solicitações, documentos e horários de atendimento de forma estruturada.

Este repositório representa um **snapshot técnico de um projeto real**, mantido como parte do meu portfólio para demonstrar experiência prática em desenvolvimento backend e arquitetura de sistemas.

O projeto foi posteriormente descontinuado, mas o código permanece público para fins de estudo e análise técnica.

---

## Objetivo do projeto

O objetivo da plataforma era digitalizar e organizar o fluxo de atendimento de cartórios, permitindo:

- gerenciamento de solicitações
- controle de documentos
- agendamentos de atendimento
- autenticação de usuários
- organização das permissões do sistema

---

## Tecnologias utilizadas

### Backend

- Python
- Django
- Django REST Framework
- JWT Authentication
- Celery

### Infraestrutura

- Docker
- Docker Compose

---

## Principais funcionalidades

O sistema foi desenvolvido para suportar:

- cadastro e autenticação de usuários
- controle de permissões
- gerenciamento de solicitações
- envio e reenvio de documentos
- agendamentos
- processamento assíncrono de tarefas

---

## Estrutura do projeto

O backend segue a estrutura típica de aplicações Django organizadas por módulos:

```
app/
  models.py
  admin.py
  permissions/
  forms/
  migrations/

core/
configurações do projeto

workers/
tarefas assíncronas com Celery

Dockerfile
docker-compose
.env.example
```

Essa organização permite separar responsabilidades e facilita a manutenção da aplicação.

---

## Arquitetura aplicada

O sistema utiliza alguns conceitos importantes de arquitetura backend:

- separação entre regras de negócio e infraestrutura
- controle de acesso via permissões
- tarefas assíncronas utilizando Celery
- autenticação baseada em JWT
- containerização da aplicação com Docker

Essas decisões foram tomadas para tornar o sistema mais escalável e organizado.

---

## Como executar o projeto

Clone o repositório:

```bash
git clone https://github.com/DanAntunesDev/balcaoVirtual-descontinuado
```

Execute o ambiente:

```bash
docker compose up
```

Ou rode manualmente o backend Django após configurar as variáveis de ambiente presentes no `.env.example`.

---

## Status do projeto

Projeto descontinuado.

O código permanece público como demonstração técnica de arquitetura backend e organização de um sistema real.

---

## Aprendizados

Durante o desenvolvimento deste projeto foram trabalhados conceitos importantes como:

- arquitetura de aplicações backend
- organização de projetos Django
- autenticação com JWT
- filas e tarefas assíncronas com Celery
- containerização com Docker
- estruturação de sistemas de agendamento

---

## Autor

Daniel Antunes
