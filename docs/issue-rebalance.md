# 📌 Feature: Ajuste Automático de Dieta via Sistema Linear (LP Solver)

## 🧠 Descrição

Adicionar funcionalidade que ajusta automaticamente os alimentos de uma dieta para atingir metas nutricionais diárias (proteína, gordura, carboidrato, etc), respeitando alimentos que devem ser fixados pelo usuário. A funcionalidade deve ser flexível, intuitiva e baseada em otimização linear (Linear Programming).

---

## ✅ Requisitos Funcionais

### 🎯 Objetivos do usuário:
1. **Preencher macros restantes** com alimentos existentes
2. **Ajustar uma dieta desbalanceada** (em déficit ou superávit)
3. **Maximizar ou minimizar** um alimento específico, quando desejado (ex: encaixar mais frango)
4. **Preservar** alimentos ou refeições específicas (marcando como "fixos")
5. **Diluir ajustes** entre múltiplos alimentos para evitar mudanças bruscas
6. **Controlar faixas permitidas** por alimento (mínimo/máximo em gramas)

---

## ⚙️ Modelo Matemático

### Variáveis:
- `kᵢ`: gramas do alimento `i` (variável de decisão)
- `pᵢⱼ`: densidade nutricional do alimento `i` no nutriente `j`
- `Tⱼ`: meta diária do nutriente `j`
- `Aⱼ`: quantidade fixa já atingida do nutriente `j` por alimentos não ajustáveis

### Sistema:
```
∑ (kᵢ * pᵢⱼ) = Tⱼ - Aⱼ   ∀ j ∈ [proteína, gordura, carb...]
kᵢ ∈ [kᵢ_min, kᵢ_max]      ∀ i ∈ alimentos editáveis
```

---

## 🧮 Solução com Linear Programming

Usar [javascript-lp-solver](https://github.com/JWally/jsLPSolver) com um modelo do tipo:

```ts
type Model = {
  optimize: string; // variável a minimizar/maximizar
  opType: 'min' | 'max';
  constraints: {
    [nutriente: string]: { equal?: number; max?: number; min?: number };
  };
  variables: {
    [alimento: string]: {
      [nutriente: string]: number;
    };
  };
  bounds?: {
    [alimento: string]: { min: number; max: number };
  };
};
```

---

## 🧩 Estratégias de Objetivo

1. **Ajuste neutro simples:**
   ```ts
   optimize: "_obj"
   // _obj = soma de gramas dos alimentos (padrão)
   ```

2. **Preservar dieta original (diluir alterações):**
   - Criar variáveis auxiliares `delta_pos_i`, `delta_neg_i`
   - Minimizar `Σ |kᵢ - kᵢ_original|` via:
     ```
     kᵢ = kᵢ_original + delta_pos_i - delta_neg_i
     min Σ (delta_pos_i + delta_neg_i)
     ```

3. **Maximizar frango, por exemplo:**
   ```ts
   optimize: "frango",
   opType: "max"
   ```

---

## 🧑‍💻 Plano de Implementação

### Back-end / Solver:
- [ ] Função `buildDietLPModel(alimentos, metas, fixos): LPModel`
- [ ] Suporte a:
  - [ ] Alimentos com `editable: false`
  - [ ] Faixa `[min, max]` por alimento
  - [ ] Otimizações personalizadas (maximizar alimento, preservar dieta, etc)

### Front-end / UI:
- [ ] Interface para:
  - [ ] Selecionar alimentos que o usuário deseja preservar
  - [ ] Exibir metas atingidas e faltantes
  - [ ] Visualizar sliders com `min`, `max`, `atual` por alimento
  - [ ] Botão "Ajustar dieta" com preview do impacto
- [ ] Modal de confirmação com resultado da otimização
- [ ] Feedback visual para:
  - [ ] Alimentos reduzidos
  - [ ] Alimentos aumentados
  - [ ] Alimentos preservados

### Experiência do Usuário:
- [ ] Exibir tooltip ao passar mouse sobre alimentos ajustáveis: "Alterado para atingir meta X"
- [ ] Oferecer 2 modos:
  - [ ] `Rápido`: aplica a sugestão direto
  - [ ] `Personalizado`: usuário define alimentos-alvo, pesos e objetivos

---

## 🧪 Testes & Validação

- [ ] Casos com solução exata
- [ ] Casos com múltiplas soluções (validar diluição)
- [ ] Casos sem solução (alerta ao usuário)
- [ ] Testar com metas ausentes (ex: só proteína)

---

## 🔮 Futuras extensões

- [ ] Suporte a micronutrientes e fibras
- [ ] Otimização com preferências de sabor ou custo
- [ ] Geração automática de dietas completas com base em templates

---

## 📦 Dependências

- [ ] `javascript-lp-solver` (ou `glpk.js` se necessário)
- [ ] TypeScript types para entrada e saída do modelo
