

# Correcao da Persistencia de Dados e Navegacao

## Diagnostico

Apos investigacao detalhada, foram encontrados **3 problemas criticos**:

### Problema 1: Pagina "Minhas Peladas" usa dados falsos (PRINCIPAL)
O arquivo `src/pages/MyMatches.tsx` **nao consulta o banco de dados**. Ele usa dados mock (fictícios) hardcoded com IDs "1", "2", "3". Quando voce cria uma partida, o app redireciona para `/my-matches`, mas essa pagina nunca busca dados reais. Por isso a pelada criada "desaparece".

### Problema 2: Pagina Inicial mostra pelada mais antiga
A pagina Index (`/`) busca dados reais, mas **nao filtra por data futura**. Ela pega `matches[0]` que e a partida mais antiga (ordenada por data crescente). As peladas de janeiro aparecem porque sao as primeiras da lista.

### Problema 3: Botao "Editar Partida" leva ao erro 404
O botao de editar navega para `/matches/:id/edit`, mas **essa rota nao existe** no App.tsx. Nao ha nenhuma pagina de edicao criada.

### Problema Extra: Contexto UserMatches e mock
O `UserMatchesContext` usa estado local com IDs mock (comeca com `['1']`). Ele nao se conecta ao banco de dados.

---

## Plano de Correcao

### Etapa 1: Reescrever MyMatches.tsx para usar dados reais
- Remover todos os imports de mock data
- Usar o hook `useMyMatches()` de `src/hooks/useMatches.ts` que ja existe e consulta o banco
- Exibir as partidas reais do usuario (criadas e participando)
- Adicionar estado de loading com skeleton
- Remover dependencia do `UserMatchesContext`

### Etapa 2: Corrigir a pagina Index para filtrar partidas futuras
- Filtrar matches para mostrar apenas datas futuras (`date >= hoje`)
- Mostrar a proxima partida (mais proxima no tempo), nao a mais antiga

### Etapa 3: Criar pagina de edicao de partida
- Criar `src/pages/EditMatch.tsx` com formulario pre-preenchido
- Adicionar rota `/matches/:id/edit` no App.tsx (protegida)
- Reutilizar a mesma estrutura do CreateMatch.tsx
- Usar `useMatch(id)` para carregar dados existentes
- Criar hook `useUpdateMatch` para salvar alteracoes

### Etapa 4: Limpar codigo legado
- Remover o `UserMatchesContext` do App.tsx (substituido pelos hooks reais)
- Limpar imports de mock data onde nao sao mais necessarios

---

## Detalhes Tecnicos

### MyMatches.tsx (reescrita)
```text
- Import useMyMatches de hooks/useMatches
- Import useAuth para verificar usuario
- Mapear dados do banco para o formato do MatchCard
- Filtrar partidas futuras e passadas em abas separadas
```

### Index.tsx (correcao)
```text
- Adicionar filtro: matches.filter(m => new Date(m.date) >= new Date())
- Pegar matches[0] apos filtro (proxima partida)
```

### EditMatch.tsx (nova pagina)
```text
- Similar ao CreateMatch.tsx
- Carrega dados via useMatch(id)
- Verifica se usuario e o criador
- Usa supabase.from('matches').update(...)
- Redireciona apos salvar
```

### App.tsx (nova rota)
```text
- Adicionar: <Route path="/matches/:id/edit" element={<ProtectedRoute><EditMatch /></ProtectedRoute>} />
```

### Arquivos modificados
1. `src/pages/MyMatches.tsx` - reescrita completa
2. `src/pages/Index.tsx` - filtro de datas
3. `src/pages/EditMatch.tsx` - arquivo novo
4. `src/App.tsx` - nova rota + remover UserMatchesProvider
5. `src/hooks/useMatches.ts` - adicionar useUpdateMatch
6. `src/contexts/UserMatchesContext.tsx` - remover (nao mais necessario)

