#!/bin/bash

# Script para migrar todos os schemas para usar createZodEntity

echo "Migrando todos os schemas para a nova API createZodEntity..."

# Lista de arquivos que precisam ser migrados
files=(
    "src/modules/diet/item/domain/item.ts"
    "src/modules/diet/item-group/domain/itemGroup.ts"
    "src/modules/diet/meal/domain/meal.ts"
    "src/modules/diet/recipe-item/domain/recipeItem.ts" 
    "src/modules/diet/macro-profile/domain/macroProfile.ts"
    "src/modules/diet/day-diet/domain/dayDiet.ts"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "Processando $file..."
        
        # Adicionar import e const ze após os imports existentes
        sed -i '/import.*validationMessages/c\import { createZodEntity } from '\''~/shared/domain/validationMessages'\''' "$file"
        
        # Adicionar const ze = createZodEntity('<entity>') após o último import
        entity=$(basename "$file" .ts)
        entity_map=""
        case "$entity" in
            "item") entity_map="item" ;;
            "itemGroup") entity_map="itemGroup" ;;
            "meal") entity_map="meal" ;;
            "recipeItem") entity_map="recipeItem" ;;
            "macroProfile") entity_map="macroProfile" ;;
            "dayDiet") entity_map="dayDiet" ;;
        esac
        
        # Adicionar const ze após imports se não existir
        if ! grep -q "const ze = createZodEntity" "$file"; then
            sed -i '/^import.*$/a\\nconst ze = createZodEntity('\'''"$entity_map"'\'')' "$file"
        fi
        
        # Substituir z.object( por ze.create(
        sed -i 's/z\.object(/ze.create(/g' "$file"
        
        # Substituir padrões de validação
        sed -i 's/z\.number(createNumberFieldMessages(\([^)]*\))(\([^)]*\)))/ze.number(\1)/g' "$file"
        sed -i 's/z\.string(createStringFieldMessages(\([^)]*\))(\([^)]*\)))/ze.string(\1)/g' "$file"
        sed -i 's/z\.date(createDateFieldMessages(\([^)]*\))(\([^)]*\)))/ze.date(\1)/g' "$file"
        sed -i 's/z\.array(\([^,]*\), createArrayFieldMessages(\([^)]*\))(\([^)]*\)))/ze.array(\2, \1)/g' "$file"
        
        echo "✓ $file migrado"
    else
        echo "⚠ $file não encontrado"
    fi
done

echo "Migração concluída!"
