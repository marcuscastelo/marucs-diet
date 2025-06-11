# Resumo das Auditorias de Prompts e Utilitários

## Principais Mudanças
| Tema                | Mudança/Resumo                                                                                 |
|---------------------|----------------------------------------------------------------------------------------------|
| Terminal            | Checagem repetida da saída até mensagem explícita de sucesso ou erro                           |
| Checklists          | Novos templates para aprendizados, bloqueios e frustrações do usuário                         |
| Acessibilidade      | Inclusão de `aria-label` e recomendações para revisar acessibilidade em toda a UI             |
| Arquitetura         | Separação clara entre domínio (puro) e aplicação (handleApiError)                             |
| JSDoc/Tipagem       | Atualização obrigatória de JSDoc para exports após mudanças                                   |
| Importações         | Sempre usar imports estáticos absolutos (`~/caminho/arquivo`)                                 |
| Formatação          | Preferência por ESLint ao invés de Prettier                                                   |
| Testes              | Cobertura obrigatória para novas funções/utilitários e atualização após mudanças              |
| Prompts Obsoletos   | Limpeza de arquivos de prompt não utilizados                                                  |
| Scripts Shell       | Novos scripts para commit/review, compatíveis com zsh/Linux                                   |

## Recomendações Gerais
| Recomendação                                    | Detalhe                                                                 |
|-------------------------------------------------|-------------------------------------------------------------------------|
| Modularizar instruções globais                  | Evitar duplicidade                                                    |
| Automatizar checagens de integridade/acessibilidade | Integrar ao CI/CD                                                     |
| Revisar periodicamente regras/scripts           | Garantir alinhamento e clareza                                        |
| Documentar requisitos de shell/OS               | Incluir dependências e compatibilidade nos scripts                     |

## Pontos de Atenção
| Ponto                  | Observação                                                                 |
|------------------------|----------------------------------------------------------------------------|
| Complexidade           | Instruções extensas podem impactar eficiência se não modularizadas          |
| Saída de terminal      | Risco de travamento se a saída for ambígua ou ausente                      |
| Funcionalidades removidas | Garantir cobertura por outros fluxos                                      |

> Este resumo cobre as principais mudanças, pontos fortes, preocupações e recomendações das auditorias recentes em prompts, scripts e utilitários do projeto. Leitura estimada: 2 minutos.
