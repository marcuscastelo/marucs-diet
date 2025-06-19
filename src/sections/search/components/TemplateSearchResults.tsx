import { type Accessor, For, type Setter } from 'solid-js'

import { type Food } from '~/modules/diet/food/domain/food'
import { createItem } from '~/modules/diet/item/domain/item'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import { getRecipePreparedQuantity } from '~/modules/diet/recipe/domain/recipeOperations'
import {
  isTemplateFood,
  type Template,
} from '~/modules/diet/template/domain/template'
import { debouncedTab } from '~/modules/search/application/search'
import { Alert } from '~/sections/common/components/Alert'
import { HeaderWithActions } from '~/sections/common/components/HeaderWithActions'
import {
  ItemFavorite,
  ItemName,
  ItemNutritionalInfo,
  ItemView,
} from '~/sections/food-item/components/ItemView'
import { RemoveFromRecentButton } from '~/sections/food-item/components/RemoveFromRecentButton'
import { calcRecipeMacros } from '~/shared/utils/macroMath'

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

            return (
              <>
                <ItemView
                  mode="read-only"
                  item={() => ({
                    ...createItem({
                      name: template.name,
                      quantity: displayQuantity,
                      macros: isTemplateFood(template)
                        ? (template as Food).macros
                        : calcRecipeMacros(template as Recipe),
                      reference: template.id,
                    }),
                    __type: isTemplateFood(template) ? 'Item' : 'RecipeItem', // TODO:   Refactor conversion from template type to group/item types
                  })}
                  class="mt-1"
                  macroOverflow={() => ({
                    enable: false,
                  })}
                  handlers={{
                    onClick: () => {
                      props.setSelectedTemplate(template)
                      props.setItemEditModalVisible(true)
                      props.setEANModalVisible(false)
                    },
                  }}
                  header={() => (
                    <HeaderWithActions
                      name={<ItemName />}
                      primaryActions={<ItemFavorite foodId={template.id} />}
                      secondaryActions={
                        <RemoveFromRecentButton
                          templateId={template.id}
                          type={isTemplateFood(template) ? 'food' : 'recipe'}
                          refetch={props.refetch}
                        />
                      }
                    />
                  )}
                  nutritionalInfo={() => <ItemNutritionalInfo />}
                />
              </>
            )
          }}
        </For>
      </div>
    </>
  )
}
