# Frontend do Balcão Virtual

SPA em React/Vite usada pelo projeto principal.

## Stack

- React
- Vite
- React Router
- Axios
- Tailwind CSS
- Sonner
- Framer Motion

## Requisitos

- Node.js 22+
- npm 10+

## Ambiente

O frontend usa um arquivo `.env` próprio dentro da pasta `frontend/`.

Variáveis esperadas:

- `VITE_API_BASE_URL`
- `VITE_API_MODE`

## Execução local

~~~bash
copy .env.example .env
npm install
npm run dev
~~~

## Build

~~~bash
npm run build
~~~

## Integração

O frontend depende do backend Django disponível em `/api`.

Base local esperada por padrão:

- `http://127.0.0.1:8000/api`