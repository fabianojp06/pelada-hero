# ⚽ Pelada Hero

> **Organize suas peladas como um profissional.** PWA completo para criar, gerenciar e participar de partidas de futebol com seus amigos.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![PWA](https://img.shields.io/badge/PWA-Instalável-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

🔗 **Acesse agora:** [pelada-hero.lovable.app](https://pelada-hero.lovable.app)

---

## 📖 Sobre o Projeto

O **Pelada Hero** é um aplicativo web progressivo (PWA) desenvolvido para facilitar a organização de peladas e partidas de futebol amador. Com ele, você pode criar partidas, convidar jogadores, sortear times equilibrados, acompanhar pagamentos e muito mais — tudo direto do celular.

### 🎯 Para quem é?

- Organizadores de peladas que querem facilitar a logística
- Jogadores que procuram partidas próximas para participar
- Grupos de amigos que jogam regularmente e precisam de organização

---

## 🚀 Funcionalidades

### 🔐 Autenticação
- Cadastro com e-mail e senha
- Login com sessão persistente
- Recuperação de senha por e-mail

### 🏟️ Gerenciamento de Partidas
- Criação de partidas com título, local, endereço, data, horário e preço
- Formato configurável: **5x5** até **11x11** (jogadores por lado)
- Limite máximo de jogadores por partida
- Edição de partidas pelo organizador
- **Partidas públicas** — qualquer jogador pode entrar
- **Partidas privadas** — entrada mediante aprovação do organizador

### 👥 Participantes
- Confirmação de presença com um toque
- **Lista de espera** automática quando a partida está cheia
- Promoção automática da lista de espera quando alguém sai
- Sistema de **co-organizadores** (até 5 por partida)

### 💰 Controle de Pagamentos
- Organizador pode marcar cada participante como **pago** ou **devendo**
- Visualização rápida do status financeiro da partida

### 📢 Resenha (Feed Interno)
- Feed de posts exclusivo para cada partida
- Publicação de **texto, imagens e vídeos**
- Sistema de **reações** com emojis temáticos:
  - ⚽ Bola (curtida)
  - 🟥 Cartão Vermelho (reprovação)
  - 👏 Aplausos

### ⚡ Sorteio de Times
- **Sorteio inteligente** — times balanceados pelo overall dos jogadores
- **Sorteio aleatório** — distribuição randômica
- Divisão visual em **Colete** vs **Sem Colete**

### 🃏 Card de Jogador (Estilo FIFA)
Cada jogador possui um card com 6 atributos:

| Atributo | Descrição |
|----------|-----------|
| **PAC** | Velocidade |
| **SHO** | Finalização |
| **PAS** | Passe |
| **DRI** | Dribles |
| **DEF** | Defesa |
| **PHY** | Físico |

- **Overall** calculado automaticamente
- **Posições:** GOL, ZAG, LAT, VOL, MEI, ATA
- Compartilhamento do card como imagem

### 👤 Perfil do Jogador
- Nome, apelido e **username (@)**
- Posição preferida
- Telefone de contato
- Foto de perfil (avatar)
- Atributos editáveis

### 🔍 Busca de Jogadores
- Pesquisa por **nome** ou **username (@)**
- Visualização do card de qualquer jogador encontrado

### 📤 Compartilhamento
- Compartilhar partida via **WhatsApp** com link direto
- Copiar link da partida para a área de transferência

### 📍 Geolocalização
- Permissão de localização para encontrar **partidas próximas**
- Badge de distância nas partidas listadas

### ⏱️ Timer de Partida
- Cronômetro integrado para controlar o tempo de jogo

### 📱 PWA (Progressive Web App)
- **Instalável** no celular (Android e iOS)
- Funciona **offline** com cache inteligente
- Ícones e splash screen configurados
- Experiência nativa no dispositivo

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|------------|-----|
| **React 18** | Biblioteca de UI |
| **TypeScript** | Tipagem estática |
| **Vite** | Build tool e dev server |
| **Tailwind CSS** | Estilização utility-first |
| **shadcn/ui** | Componentes de UI acessíveis |
| **TanStack React Query** | Gerenciamento de estado servidor |
| **React Router DOM** | Roteamento SPA |
| **React Hook Form + Zod** | Formulários e validação |
| **date-fns** | Manipulação de datas |
| **Recharts** | Gráficos e visualizações |
| **Lucide React** | Ícones |
| **Sonner** | Notificações toast |
| **Framer Motion (vaul)** | Animações e drawers |
| **vite-plugin-pwa** | Suporte a PWA |
| **Lovable Cloud** | Backend, autenticação e banco de dados |

---

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/              # Componentes shadcn/ui
│   ├── BottomNav.tsx    # Navegação inferior mobile
│   ├── FeedPost.tsx     # Post do feed Resenha
│   ├── Header.tsx       # Cabeçalho do app
│   ├── Layout.tsx       # Layout principal
│   ├── MatchCard.tsx    # Card de partida
│   ├── MatchTimer.tsx   # Timer de partida
│   ├── PlayerCard.tsx   # Card estilo FIFA
│   ├── ShareMatch.tsx   # Compartilhamento
│   ├── SmartTeamSorter.tsx  # Sorteio inteligente
│   ├── TeamSorter.tsx   # Sorteio de times
│   └── WaitingListManager.tsx  # Lista de espera
├── contexts/            # Contextos React
│   ├── AuthContext.tsx   # Autenticação
│   ├── MatchFeedContext.tsx  # Feed da partida
│   └── UserMatchesContext.tsx  # Partidas do usuário
├── hooks/               # Custom hooks
│   ├── useGeolocation.ts     # Geolocalização
│   ├── useMatches.ts         # Operações de partidas
│   ├── useMatchOrganizers.ts # Co-organizadores
│   ├── useProfile.ts         # Perfil do jogador
│   └── usePWAInstall.ts      # Instalação PWA
├── integrations/        # Integrações externas
│   └── supabase/        # Cliente e tipos do backend
├── pages/               # Páginas da aplicação
│   ├── Auth.tsx          # Login e cadastro
│   ├── CreateMatch.tsx   # Criar partida
│   ├── EditMatch.tsx     # Editar partida
│   ├── Feed.tsx          # Feed geral
│   ├── Index.tsx         # Página inicial
│   ├── MatchDetails.tsx  # Detalhes da partida
│   ├── Matches.tsx       # Lista de partidas
│   ├── MyMatches.tsx     # Minhas partidas
│   ├── Profile.tsx       # Perfil do jogador
│   ├── SearchUsers.tsx   # Busca de jogadores
│   └── Teams.tsx         # Sorteio de times
├── types/               # Tipos TypeScript
│   ├── database.ts       # Tipos do banco
│   └── index.ts          # Tipos gerais
└── main.tsx             # Entry point
```

---

## 🗄️ Banco de Dados

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Dados dos jogadores (nome, posição, atributos, avatar, username) |
| `matches` | Partidas criadas (título, local, data, horário, preço, coordenadas) |
| `user_matches` | Relação jogador ↔ partida (status: joined/confirmed/waiting, pagamento) |
| `match_feed_posts` | Posts do feed Resenha (texto, imagem, vídeo) |
| `post_reactions` | Reações aos posts (⚽ 🟥 👏) |
| `match_organizers` | Co-organizadores das partidas (máx. 5 por partida) |

### Diagrama Simplificado

```
profiles ──┬── matches (creator_id)
           ├── user_matches (user_id ↔ match_id)
           ├── match_feed_posts (author_id ↔ match_id)
           ├── post_reactions (user_id ↔ post_id)
           └── match_organizers (user_id ↔ match_id)
```

---

## 💻 Como Rodar Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v18+)
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone <URL_DO_REPOSITÓRIO>

# Entre no diretório
cd pelada-hero

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

O app estará disponível em `http://localhost:5173`

---

## 🔑 Variáveis de Ambiente

O projeto utiliza as seguintes variáveis de ambiente (configuradas automaticamente pelo Lovable Cloud):

| Variável | Descrição |
|----------|-----------|
| `VITE_SUPABASE_URL` | URL do backend |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave pública do backend |

---

## 🚀 Deploy

O deploy é feito automaticamente pela plataforma [Lovable](https://lovable.dev):

1. Acesse o projeto no Lovable
2. Clique em **Share → Publish**
3. Pronto! Seu app estará disponível em [pelada-hero.lovable.app](https://pelada-hero.lovable.app)

---

## 📄 Licença

Este projeto é privado e desenvolvido com [Lovable](https://lovable.dev).

---

<p align="center">
  Feito com ❤️ e ⚽ por jogadores, para jogadores.
</p>
