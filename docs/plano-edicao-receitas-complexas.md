# Plano para Suporte à Edição de Receitas Complexas

## 1. Análise de Impacto

### Onde a restrição aparece:
- Em `GroupHeaderActions.tsx`, a função `isRecipeTooComplex` impede ações de edição/paste quando `recipe.prepared_multiplier !== 1`.
- Em `ItemGroupEditModalBody.tsx`, impede edição de itens de grupos ligados a receitas complexas.

### O que significa "receita complexa":
- Receitas com `prepared_multiplier !== 1` (provavelmente receitas compostas, com porções ou transformações).

### Impactos:
- **UI:** Botões de edição/paste ficam desabilitados ou mostram erro para receitas complexas.
- **Domain:** Não há lógica para editar receitas complexas (ex: atualizar itens, recalcular proporções, etc).
- **Application:** Não há orquestração para atualizar corretamente receitas complexas.
- **Testes:** Não há cobertura para edição de receitas complexas.

---

## 2. Plano Detalhado para Suporte

### A. Remover bloqueios na UI
- Remover chamadas a `isRecipeTooComplex` e mensagens de erro relacionadas.
- Permitir que botões de edição/paste fiquem habilitados para qualquer receita.

### B. Atualizar lógica de edição
- Garantir que funções de edição (paste, editar item, etc) funcionem corretamente para receitas com `prepared_multiplier !== 1`.
- Verificar se há dependências de proporção/quantidade que precisam ser recalculadas ao editar itens.

### C. Ajustar domínio
- Revisar funções de domínio para garantir que aceitam e processam corretamente receitas complexas.
- Adicionar testes de unidade para casos de edição de receitas complexas.

### D. Ajustar camada de aplicação
- Garantir que erros específicos de receitas complexas sejam tratados via `handleApiError` se necessário.
- Orquestrar atualizações de receitas complexas corretamente (ex: atualizar prepared_multiplier, recalcular itens, etc).

### E. Atualizar testes
- Adicionar/atualizar testes para cobrir edição de receitas complexas (paste, editar item, salvar, etc).
- Garantir que `npm run check` passe com todos os cenários.

### F. Documentação
- Atualizar JSDoc de funções exportadas afetadas.
- Atualizar documentação de arquitetura se necessário.

---

## 3. Próximos Passos (Execução)

1. Remover restrições de UI (funções e mensagens de erro).
2. Validar e ajustar lógica de edição/paste para receitas complexas.
3. Revisar e ajustar domínio e aplicação conforme necessário.
4. Atualizar e criar testes.
5. Validar com `npm run check | tee /tmp/copilot-terminal 2>&1`.
6. Sugerir commit atômico para cada etapa.
