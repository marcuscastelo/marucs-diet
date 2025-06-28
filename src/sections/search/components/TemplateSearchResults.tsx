import { type Accessor, For, type Setter } from 'solid-js'

import { getRecipePreparedQuantity } from '~/modules/diet/recipe/domain/recipeOperations'
import { templateToUnifiedItem } from '~/modules/diet/template/application/templateToItem'
import {
  isTemplateFood,
  type Template,
} from '~/modules/diet/template/domain/template'
import { debouncedTab } from '~/modules/search/application/search'
import { Alert } from '~/sections/common/components/Alert'
import { RemoveFromRecentButton } from '~/sections/common/components/buttons/RemoveFromRecentButton'
import { UnifiedItemFavorite } from '~/sections/unified-item/components/UnifiedItemFavorite'
import { UnifiedItemView } from '~/sections/unified-item/components/UnifiedItemView'
import { createDebug } from '~/shared/utils/createDebug'

const debug = createDebug()

export function TemplateSearchResults(props: {
  search: string
  filteredTemplates: readonly Template[]
  setSelectedTemplate: (template: Template | undefined) => void
  EANModalVisible: Accessor<boolean>
  setEANModalVisible: Setter<boolean>
  itemEditModalVisible: Accessor<boolean>
  setItemEditModalVisible: Setter<boolean>
  refetch: (info?: unknown) => unknown
}) {
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
                const recipe = template
                debug('recipe', recipe)
                const preparedQuantity = getRecipePreparedQuantity(recipe)
                debug('recipe.preparedQuantity', preparedQuantity)
                return preparedQuantity
              }
            }

            const displayQuantity = getDisplayQuantity()

            // Convert template to UnifiedItem using shared utility
            const createUnifiedItemFromTemplate = () => {
              const result = templateToUnifiedItem(template, displayQuantity)
              debug('createUnifiedItemFromTemplate', result)
              return result
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
                  primaryActions={<UnifiedItemFavorite foodId={template.id} />}
                  secondaryActions={
                    <RemoveFromRecentButton
                      templateId={template.id}
                      type={isTemplateFood(template) ? 'food' : 'recipe'}
                      refetch={props.refetch}
                    />
                  }
                />
              </>
            )
          }}
        </For>
      </div>
    </>
  )
}
