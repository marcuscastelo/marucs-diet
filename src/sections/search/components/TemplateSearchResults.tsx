import { type Accessor, For, type Setter } from 'solid-js'

import { type Food } from '~/modules/diet/food/domain/food'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import { getRecipePreparedQuantity } from '~/modules/diet/recipe/domain/recipeOperations'
import {
  isTemplateFood,
  type Template,
} from '~/modules/diet/template/domain/template'
import { createUnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { debouncedTab } from '~/modules/search/application/search'
import { Alert } from '~/sections/common/components/Alert'
import { RemoveFromRecentButton } from '~/sections/common/components/buttons/RemoveFromRecentButton'
import { HeaderWithActions } from '~/sections/common/components/HeaderWithActions'
import {
  UnifiedItemFavorite,
  UnifiedItemName,
  UnifiedItemView,
  UnifiedItemViewNutritionalInfo,
} from '~/sections/unified-item/components/UnifiedItemView'

export function TemplateSearchResults(props: {
  search: string
  filteredTemplates: readonly Template[]
  setSelectedTemplate: (food: Template | undefined) => void
  EANModalVisible: Accessor<boolean>
  setEANModalVisible: Setter<boolean>
  itemEditModalVisible: Accessor<boolean>
  setItemEditModalVisible: Setter<boolean>
  refetch: (info?: unknown) => unknown
}) {
  // Rounding factor for recipe display quantity
  const RECIPE_ROUNDING_FACTOR = 50

  return (
    <>
      {props.filteredTemplates.length === 0 && (
        <Alert color="yellow" class="mt-2">
          {debouncedTab() === 'recent' && props.search === ''
            ? 'Sem alimentos recentes. Eles aparecerão aqui assim que você adicionar seu primeiro alimento'
            : debouncedTab() === 'favorites' && props.search === ''
              ? 'Sem favoritos. Adicione alimentos ou receitas aos favoritos para vê-los aqui.'
              : `Nenhum alimento encontrado para a busca "${props.search}".`}
        </Alert>
      )}

      <div class="flex-1 min-h-0 max-h-[60vh] overflow-y-auto scrollbar-gutter-outside scrollbar-clean bg-gray-800 mt-1 pr-4">
        <For each={props.filteredTemplates}>
          {(template) => {
            // Calculate appropriate display quantity for each template
            const getDisplayQuantity = () => {
              if (isTemplateFood(template)) {
                return 100 // Standard 100g for foods
              } else {
                // For recipes, show the prepared quantity rounded to nearest RECIPE_ROUNDING_FACTOR
                const recipe = template as Recipe
                const preparedQuantity = getRecipePreparedQuantity(recipe)
                return Math.max(
                  RECIPE_ROUNDING_FACTOR,
                  Math.round(preparedQuantity / RECIPE_ROUNDING_FACTOR) *
                    RECIPE_ROUNDING_FACTOR,
                )
              }
            }

            const displayQuantity = getDisplayQuantity()

            // Convert template to UnifiedItem
            const createUnifiedItemFromTemplate = () => {
              if (isTemplateFood(template)) {
                const food = template as Food
                return createUnifiedItem({
                  id: template.id,
                  name: template.name,
                  quantity: displayQuantity,
                  reference: {
                    type: 'food',
                    id: template.id,
                    macros: food.macros,
                  },
                })
              } else {
                return createUnifiedItem({
                  id: template.id,
                  name: template.name,
                  quantity: displayQuantity,
                  reference: {
                    type: 'recipe',
                    id: template.id,
                    children: [], // Recipe children would need to be populated separately
                  },
                })
              }
            }

            return (
              <>
                <UnifiedItemView
                  mode="read-only"
                  item={createUnifiedItemFromTemplate}
                  class="mt-1"
                  handlers={{
                    onClick: () => {
                      props.setSelectedTemplate(template)
                      props.setItemEditModalVisible(true)
                      props.setEANModalVisible(false)
                    },
                  }}
                  header={() => (
                    <HeaderWithActions
                      name={
                        <UnifiedItemName item={createUnifiedItemFromTemplate} />
                      }
                      primaryActions={
                        <UnifiedItemFavorite foodId={template.id} />
                      }
                      secondaryActions={
                        <RemoveFromRecentButton
                          templateId={template.id}
                          type={isTemplateFood(template) ? 'food' : 'recipe'}
                          refetch={props.refetch}
                        />
                      }
                    />
                  )}
                  nutritionalInfo={() => (
                    <UnifiedItemViewNutritionalInfo
                      item={createUnifiedItemFromTemplate}
                    />
                  )}
                />
              </>
            )
          }}
        </For>
      </div>
    </>
  )
}
