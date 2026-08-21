# Oficina

![CI](https://github.com/mateus9785/oficina/actions/workflows/ci.yml/badge.svg)

Um sistema de gestão para oficina mecânica: clientes, veículos,
ordens de serviço em um quadro kanban (aguardando aprovação → aguardando peça →
em execução → pronto pra retirada → finalizado), controle de estoque de peças e um
módulo financeiro que transforma uma ordem finalizada em uma conta a receber
automaticamente.

Construído com uma stack moderna (React 19 / Vite 7 / TypeScript strict no
frontend, Express / TypeScript strict / mysql2 no backend), com um refactor
de backend focado em transações reais multi-tabela envolvendo estoque e
financeiro.

## Stack

**Backend** (`backend/`)
- Node.js + **Express 4** + **TypeScript** (`strict: true`)
- **MySQL** via o driver bruto **mysql2**, sem ORM
- Autenticação **JWT** (access + refresh tokens), `bcryptjs`, `express-validator`,
  `helmet`, `express-rate-limit`
- **Vitest** + **Supertest** para os testes
- **ESLint** (recomendado do `typescript-eslint`) + **Prettier** +
  **Husky**/**lint-staged**/**commitlint**

**Frontend** (`frontend/`)
- **React 19** + **Vite 7** + **TypeScript** (`strict: true`, além de
  `noUnusedLocals`/`noUnusedParameters`/`noFallthroughCasesInSwitch`)
- **Zustand** para gerenciamento de estado (sem biblioteca de data-fetching; um
  pequeno wrapper de `fetch` em `src/lib/api.ts`)
- **Tailwind CSS v4**, primitivos de UI feitos à mão (sem biblioteca de
  componentes), `@dnd-kit` (drag-and-drop do kanban), `recharts` (gráficos do
  financeiro/relatórios)
- **Vitest** + **React Testing Library** para os testes
- **ESLint** (flat config, `typescript-eslint` + `eslint-plugin-react-hooks`)
  + **Prettier**

## Arquitetura

```
repo root/
  package.json         <- tooling only (husky/lint-staged/commitlint), not a workspace
  backend/              own package.json + package-lock.json
    src/
      routes/     ->  controllers/  ->  services/  ->  repositories/  ->  mysql2 pool
                                              |
                                        middleware/ (auth, error handling, validation)
  frontend/             own package.json + package-lock.json
    src/
      pages/  ->  components/  ->  stores/ (Zustand)  ->  lib/api.ts  ->  backend
```

`backend/` e `frontend/` são dois projetos npm totalmente independentes (cada
um com seu próprio `package.json` e lockfile) dentro de um único repositório,
não um workspace npm/pnpm: eles não compartilham código, dependências ou
etapa de build, então um workspace adicionaria indireção sem benefício. O
`package.json` da raiz existe apenas para hospedar Husky/lint-staged/commitlint,
de forma que um único git hook cubra commits para os dois lados; é por isso
também que existe um terceiro `package-lock.json` na raiz do repositório, o
que não é um engano.

Apenas `clientes` e `ordens` (as entidades com maior complexidade de regras de
negócio: dedução de estoque, geração de contas a receber, transações
multi-tabela) passam por uma separação em `repositories/` + `services/` no
backend; os outros 10 controllers ainda consultam o banco de dados
diretamente. Essa foi uma decisão deliberada de escopo, não um descuido (veja
[Limitações conhecidas](#limitações-conhecidas--próximos-passos)).

## Decisões Técnicas

- **Driver bruto mysql2, sem ORM.** Uma escolha deliberada pré-existente,
  mantida como está: não foi revisitada nesta etapa.
- **`services/` + `repositories/` apenas para clientes/ordens.** Esses dois
  controllers tinham cerca de 32 queries SQL brutas e 4 transações
  multi-tabela escritas à mão entre eles (finalizar uma ordem → criar uma
  conta a receber; adicionar/editar/remover um item → ajustar o estoque de
  peças). Os outros 10 controllers são CRUD mais simples, sem risco de
  transação comparável: extrair camadas ali não demonstraria nada que os dois
  primeiros já não mostrem, então isso ficou explicitamente fora de escopo em
  vez de malfeito em todo lugar.
- **Transações sempre abrem no service, nunca no repository.** Um repository
  representa uma tabela; decidir que finalizar uma ordem e criar uma conta a
  receber precisa ser atômico é uma decisão de regra de negócio, não um
  detalhe de armazenamento. Métodos de repository que só fazem sentido dentro
  de uma transação recebem `conn: PoolConnection` sem `?`, de forma que o
  compilador recusa uma chamada fora de uma transação.
- **Tipos de linha gerados a partir do `schema.sql`, não adivinhados.**
  Colunas `DECIMAL` são tipadas como `string` e colunas `TINYINT(1)` como
  `number`, correspondendo ao que o mysql2 de fato retorna (sem
  `decimalNumbers: true` no pool): tipado conforme o driver devolve, não
  conforme o significado conceitual da coluna.
- **Vitest em vez de Jest no backend**, mesmo sendo `"type": "commonjs"`. O
  Vitest não exige nenhuma configuração de transformação para TypeScript, e é
  o mesmo executor usado no frontend: uma ferramenta a menos para conhecer ao
  avaliar o repositório inteiro.
- **`tsconfig.build.json`, separado do `tsconfig.json`, no backend.** O
  `include` padrão do `tsc` pega os arquivos `*.test.ts`; sem uma
  configuração específica de build excluindo-os, `npm run build` geraria
  código de teste dentro de `dist/`. A configuração base continua os
  incluindo para checagem de tipos/IDE.
- **Padrões de era CRA (`react-scripts`) evitados de propósito**: este
  frontend não foi migrado de nada, começou direto no Vite, então não há
  decisões de ferramentas legadas para documentar aqui.

## Configuração

Requer Node 20+ e uma instância MySQL 8.

```bash
# MySQL (one-liner, no compose file in this repo)
docker run -d --name oficina-mysql -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=oficina -p 3306:3306 mysql:8

# Backend
cd backend
npm ci
cp .env.example .env   # fill in DB_*/JWT_* at minimum
npm run db:migrate
npm run db:seed        # admin@oficina.com / admin123
npm run dev             # http://localhost:3001

# Frontend (separate terminal)
cd frontend
npm ci
cp .env.example .env   # VITE_API_URL, only needed if the backend isn't on :3001
npm run dev             # http://localhost:5173
```

## Testes

```bash
cd backend && npm test    # Vitest: unit (mocked pool) + integration (real MySQL)
cd frontend && npm test   # Vitest + React Testing Library
```

Os testes de integração do backend rodam contra um banco MySQL real (o mesmo
da seção Configuração funciona, ou um descartável); eles fazem `TRUNCATE` nas
tabelas que tocam antes de cada teste, então não aponte `DB_NAME` para um
banco com dados que importam. O CI sobe seu próprio container de serviço
MySQL.

## Limitações conhecidas / Próximos passos

- A camada `services`/`repositories` cobre apenas `clientes` e `ordens`; os
  outros 10 controllers do backend (`anexos`, `auth`, `configuracoes`,
  `estoque`, `financeiro`, `notificacoes`, `recorrentes`, `relatorios`,
  `usuarios`, `veiculos`) ainda consultam o banco de dados diretamente.
  Decisão deliberada de escopo (veja [Arquitetura](#arquitetura)), candidatos
  ao mesmo tratamento se o projeto for estendido.
- `listar` em `ordens` faz uma query para a página de ordens e depois uma
  consulta adicional por ordem para buscar seus itens/checklist (N+1):
  herdado da implementação original, não introduzido nem corrigido nesta
  etapa.
- A cobertura de testes é representativa, não exaustiva: o backend cobre os
  repositories e routes das duas entidades refatoradas; o frontend cobre as
  funções puras com maior risco real de bug (`calculators.ts`), além de uma
  store e um componente como padrão de referência, não todas as 8 stores ou
  os 32 componentes.
- A leitura de estoque em `editarItem` acontece antes de sua transação abrir
  (uma pequena janela de corrida pré-existente e sem proteção): preservada
  como está em vez de ser silenciosamente alterada durante o refactor;
  documentada no PR `refactor/backend-services-repositories`.

## Licença

[MIT](./LICENSE)
