import { type Accessor, For, type Setter } from 'solid-js'

import { calcRecipeMacros } from '~/legacy/utils/macroMath'
import { type Food } from '~/modules/diet/food/domain/food'
import { createItem } from '~/modules/diet/item/domain/item'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import {
  isTemplateFood,
  type Template,
} from '~/modules/diet/template/domain/template'
import { Alert } from '~/sections/common/components/Alert'
import { HeaderWithActions } from '~/sections/common/components/HeaderWithActions'
import {
  ItemFavorite,
  ItemName,
  ItemNutritionalInfo,
  ItemView,
} from '~/sections/food-item/components/ItemView'
import { RemoveFromRecentButton } from '~/sections/food-item/components/RemoveFromRecentButton'

export function TemplateSearchResults(props: {
  search: string
  typing: Accessor<boolean>
  filteredTemplates: readonly Template[]
  setSelectedTemplate: (food: Template | undefined) => void
  barCodeModalVisible: Accessor<boolean>
  setBarCodeModalVisible: Setter<boolean>
  itemEditModalVisible: Accessor<boolean>
  setItemEditModalVisible: Setter<boolean>
  refetch: () => Promise<void>
}) {
  return (
    <>
      {!props.typing() && props.filteredTemplates.length === 0 && (
        <Alert color="yellow" class="mt-2">
          Nenhum alimento encontrado para a busca &quot;{props.search}&quot;.
        </Alert>
      )}

      <div class="bg-gray-800 p-1">
        <For each={props.filteredTemplates}>
          {(template) => {
            return (
              <>
                <ItemView
                  item={() => ({
                    ...createItem({
                      name: template.name,
                      quantity: 100,
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
                  onClick={() => {
                    props.setSelectedTemplate(template)
                    props.setItemEditModalVisible(true)
                    props.setBarCodeModalVisible(false)
                  }}
                  header={
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
                  }
                  nutritionalInfo={<ItemNutritionalInfo />}
                />
              </>
            )
          }}
        </For>
      </div>
    </>
  )
}
