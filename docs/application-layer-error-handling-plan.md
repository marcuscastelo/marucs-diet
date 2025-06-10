# Application Layer Error Handling & Toast Refactor Plan

## Objetivo

Padronizar o tratamento de erros e feedback ao usuário em todos os arquivos `application/*.ts` dos módulos, seguindo o padrão já aplicado em `src/modules/diet/recipe/application/recipe.ts`.

---

## 1. Identificação dos Arquivos

- Localize todos os arquivos `application/*.ts` em `src/modules/**/application/`.
- Liste-os para controle de progresso.

---

## 2. Refatoração de Tratamento de Erros

Para cada função exportada na camada application:

- **Nunca lançar erros para a UI:**  
  - Sempre capture erros com `try/catch`.
  - Nunca use `throw` na camada application.
- **Chame sempre `handleApiError` no catch:**  
  - No bloco `catch`, chame `handleApiError` passando o erro e contexto relevante.
  - Exemplo:  
    ```ts
    catch (error) {
      handleApiError(error, { context: 'nomeDaFuncao', audience: 'user' });
      return valorSeguroPadrao;
    }
    ```
- **Retorne sempre um valor seguro:**  
  - Após capturar o erro, retorne um valor seguro (ex: array vazio, objeto default, etc).

---

## 3. Padronização de Feedback ao Usuário

- **Use sempre `showPromise` para feedback de usuário:**  
  - Envolva operações assíncronas que afetam o usuário com `showPromise`.
  - Sempre passe `{ context, audience }` como terceiro argumento.
  - Exemplo:  
    ```ts
    return showPromise(
      () => chamadaAssincrona(),
      {
        loading: 'Carregando...',
        success: 'Sucesso!',
        error: 'Erro ao executar ação.',
      },
      { context: 'nomeDaFuncao', audience: 'user' }
    );
    ```
- **Nunca exiba toasts diretamente sem `showPromise`.**

---

## 4. Atualização de JSDoc

- **Atualize o JSDoc de todas as funções exportadas:**  
  - Descreva propósito, parâmetros e valor de retorno.
  - Remova JSDoc desatualizado se a exportação mudar.
  - Não adicione JSDoc para funções internas.

---

## 5. Imports

- **Sempre use imports estáticos no topo.**
- **Nunca use imports relativos:**  
  - Use sempre `~/` para caminhos absolutos.

---

## 6. Testes

- **Atualize ou remova testes relacionados a mudanças.**
- **Garanta que todos os testes passem após as alterações.**

---

## 7. Lint, Type-Check e Checks

- **Após cada alteração em lote, execute:**  
  - `npm run check`
  - Aguarde a mensagem "All checks passed" antes de prosseguir.

---

## 8. Commits

- **Faça commits pequenos e atômicos.**
- **Sugira mensagens de commit no padrão conventional commits.**

---

## 9. Exemplo de Refatoração

Antes:
```ts
export async function doSomething() {
  // ...código...
  if (erro) throw new Error('Falha');
  // ...código...
}
```

Depois:
```ts
/**
 * Executes something important.
 * @returns Result or safe fallback.
 */
export async function doSomething() {
  try {
    return await showPromise(
      () => chamadaAssincrona(),
      {
        loading: 'Carregando...',
        success: 'Sucesso!',
        error: 'Erro ao executar ação.',
      },
      { context: 'doSomething', audience: 'user' }
    );
  } catch (error) {
    handleApiError(error, { context: 'doSomething', audience: 'user' });
    return valorSeguroPadrao;
  }
}
```

---

## 10. Checklist de Conclusão

- [ ] Todos os arquivos `application/*.ts` revisados.
- [ ] Todos os erros tratados com `handleApiError`.
- [ ] Todos os feedbacks ao usuário via `showPromise`.
- [ ] JSDoc atualizado para todas as exports.
- [ ] Imports corrigidos.
- [ ] Testes atualizados e passando.
- [ ] Lint e type-check sem erros.
- [ ] Commits atômicos realizados.

---

Siga este plano para garantir padronização e robustez em toda a camada application.
