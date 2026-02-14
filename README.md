# Nify Portal

Aplicativo de lista de usuários com Next.js, Prisma ORM e PostgreSQL (Docker).

## Tipos de usuário

- **Admin**: login com nickname e senha; pode listar, criar, editar, excluir usuários e promover usuários a admin (definindo senha).
- **User**: cadastro via formulário (nickname, WhatsApp, nome real).

## Pré-requisitos

- Node.js 18+
- Docker e Docker Compose

## Como rodar

1. **Subir o PostgreSQL:**

```bash
docker-compose up -d
```

2. **Instalar dependências e configurar o banco:**

```bash
npm install
cp .env.example .env
npx prisma db push
npx prisma db seed
```

3. **Iniciar o app:**

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Admin padrão

- **Nickname:** drlazinho  
- **Senha:** 123456  

## Scripts

- `npm run dev` – servidor de desenvolvimento
- `npm run build` / `npm start` – build e produção
- `npm run db:push` – aplicar schema no banco
- `npm run db:seed` – rodar seed (cria admin drlazinho)
- `npm run db:studio` – abrir Prisma Studio
