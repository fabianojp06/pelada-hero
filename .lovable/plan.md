
# Criar README.md completo para o Pelada Hero

## O que sera feito

Criar um arquivo `README.md` profissional e bem elaborado documentando todas as funcionalidades do Pelada Hero, incluindo:

### Estrutura do README

1. **Header com logo e badges** - Nome do projeto, descricao curta, badges de tecnologias
2. **Sobre o Projeto** - Descricao completa do app (PWA para organizar peladas/partidas de futebol)
3. **Funcionalidades** - Lista completa de todos os recursos:
   - Autenticacao (cadastro com email, login, recuperacao de senha)
   - Criacao e gerenciamento de partidas (titulo, local, data, horario, preco, formato 5x5 ate 11x11)
   - Partidas publicas e privadas com sistema de aprovacao
   - Confirmacao de presenca e lista de espera
   - Sistema de co-organizadores (ate 5 por partida)
   - Controle de pagamentos dos participantes
   - Feed interno da partida ("Resenha") com posts, imagens, videos e reacoes
   - Sorteio de times inteligente (balanceado por overall ou aleatorio)
   - Card de jogador estilo FIFA com atributos (pace, shooting, passing, dribbling, defending, physical)
   - Perfil com posicao, username (@), telefone e compartilhamento de card
   - Busca de jogadores por nome ou username
   - Compartilhamento de partidas via WhatsApp e link
   - Geolocalizacao para partidas proximas
   - Timer de partida
   - PWA instalavel (funciona offline, instala no celular)
4. **Tecnologias** - Stack completa:
   - React 18 + TypeScript + Vite
   - Tailwind CSS + shadcn/ui
   - TanStack React Query
   - React Router DOM
   - Recharts
   - Zod (validacao)
   - date-fns
   - PWA (vite-plugin-pwa)
   - Lovable Cloud (backend, auth, banco de dados)
5. **Estrutura do Projeto** - Arvore de diretorios principais
6. **Banco de Dados** - Tabelas principais (profiles, matches, user_matches, match_feed_posts, post_reactions, match_organizers)
7. **Como Rodar Localmente** - Instrucoes de instalacao e execucao
8. **Variaveis de Ambiente** - Quais variaveis sao necessarias
9. **Deploy** - Informacao sobre publicacao
10. **Licenca**

### Detalhes tecnicos

- Arquivo: `README.md` (substituir o conteudo atual generico)
- Linguagem: Portugues (BR), pois o app e em portugues
- Formato: Markdown com emojis, badges, tabelas e secoes bem organizadas
