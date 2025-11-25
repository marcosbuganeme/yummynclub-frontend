# YummyNClub Frontend

Frontend da plataforma YummyNClub construído com React + TypeScript + Vite.

## Stack Tecnológica

- **React**: 19.2
- **TypeScript**: 5.9
- **Vite**: 7.2
- **Tailwind CSS**: 4.1
- **React Router**: Para navegação
- **TanStack Query**: Para gerenciamento de estado do servidor
- **shadcn/ui**: Componentes de UI (a ser instalado)
- **Context API**: Para estado global

## Requisitos

- Node.js 22.14.0+
- npm ou yarn

## Instalação

### Local

1. Instalar dependências:
```bash
npm install
```

2. Copiar arquivo de ambiente:
```bash
cp .env.example .env
```

3. Configurar variáveis de ambiente no `.env`:
```env
VITE_API_URL=http://localhost:8000/api/v1
```

4. Iniciar servidor de desenvolvimento:
```bash
npm run dev
```

### Docker

O projeto está configurado para funcionar com Docker Compose. Veja o `docker-compose.yml` na raiz do projeto.

## Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── contexts/       # Contexts para estado global
│   ├── hooks/          # Custom hooks
│   ├── pages/          # Páginas da aplicação
│   ├── services/        # Serviços de API
│   ├── types/          # Tipos TypeScript
│   ├── utils/          # Utilitários
│   └── App.tsx         # Componente principal
├── public/             # Arquivos estáticos
└── package.json
```

## Configuração shadcn/ui

Para instalar componentes do shadcn/ui:

```bash
npx shadcn@latest init
npx shadcn@latest add [component-name]
```

## Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa linter

## Documentação

Consulte a documentação completa em `docs/frontend/README.md`.
