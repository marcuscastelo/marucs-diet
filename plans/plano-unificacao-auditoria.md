# Plano de Unificação e Padronização de Auditoria de Código e Resumo

## 1. Refatorar Prompt de Code Review Profundo
| Arquivo                                      | Motivo da alteração                        |
|----------------------------------------------|--------------------------------------------|
| .github/prompts/code-review-deep-table.prompt.md | Refatoração/unificação e clareza           |

## 2. Atualizar/Padronizar Geração do Resumo de Auditorias
| Arquivo                        | Motivo da alteração                        |
|--------------------------------|--------------------------------------------|
| docs/RESUMO_AUDITORIAS.md      | Padronização e automação da geração        |

## 3. Revisar e Atualizar Documentação de Auditorias
| Arquivo                                         | Motivo da alteração                        |
|-------------------------------------------------|--------------------------------------------|
| docs/audit_code_review_*.md                     | Padronização de seções e linguagem         |

## 4. Atualizar/Padronizar Prompts Relacionados
| Arquivo                                                    | Motivo da alteração                        |
|------------------------------------------------------------|--------------------------------------------|
| .github/prompts/code-review.prompt.md                      | Referência ao novo fluxo                   |
| .github/prompts/fix.prompt.md                              | Referência ao novo fluxo                   |
| .github/prompts/process-summaries.prompt.md                | Referência ao novo fluxo                   |

## 5. Atualizar Documentação de Contribuição/Guia
| Arquivo                                | Motivo da alteração                        |
|----------------------------------------|--------------------------------------------|
| docs/COPILOT_SHORT_GUIDE.md            | Instrução sobre novo fluxo                 |

## 6. (Opcional) Automatizar Checagem de Consistência
| Arquivo                        | Motivo da alteração                        |
|--------------------------------|--------------------------------------------|
| scripts/check-audit-summary.sh | Novo script de automação                   |

### Resumo dos Commits Atômicos

1. **refactor(prompt): unify deep code review and summary table generation**
   - Arquivo: `.github/prompts/code-review-deep-table.prompt.md`

2. **feat(audit): standardize and automate RESUMO_AUDITORIAS.md generation**
   - Arquivo: `docs/RESUMO_AUDITORIAS.md`

3. **chore(audit): update all audit_code_review_*.md files to new section/table standard**
   - Arquivo: `docs/audit_code_review_*.md`

4. **refactor(prompts): update related prompts to reference new audit/summary flow**
   - Arquivos: `.github/prompts/code-review.prompt.md`, `.github/prompts/fix.prompt.md`, `.github/prompts/process-summaries.prompt.md`

5. **docs(guide): add instructions for new audit and summary workflow**
   - Arquivo: `docs/COPILOT_SHORT_GUIDE.md`

6. **ci(audit): add script to check audit-summary consistency (optional)**
   - Arquivo: `scripts/check-audit-summary.sh`
