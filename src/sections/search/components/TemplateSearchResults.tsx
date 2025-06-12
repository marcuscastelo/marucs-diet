import { type Accessor, For, type Setter } from 'solid-js'

import { calcRecipeMacros } from '~/legacy/utils/macroMath'
import { type Food } from '~/modules/diet/food/domain/food'
import { createItem } from '~/modules/diet/item/domain/item'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import {
  isTemplateFood,
  type Template,
} from '~/modules/diet/template/domain/template'
import { templateSearchTab } from '~/modules/search/application/search'
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
  refetch: (info?: unknown) => unknown
}) {
  return (
    <>
      {!props.typing() && props.filteredTemplates.length === 0 && (
        <Alert color="yellow" class="mt-2">
          {templateSearchTab() === 'recent' && props.search === ''
            ? 'Sem alimentos recentes. Eles aparecerão aqui assim que você adicionar seu primeiro alimento'
            : templateSearchTab() === 'favorites' && props.search === ''
              ? 'Sem favoritos. Adicione alimentos ou receitas aos favoritos para vê-los aqui.'
              : `Nenhum alimento encontrado para a busca "${props.search}".`}
        </Alert>
      )}

      <div class="flex-1 min-h-0 max-h-[60vh] overflow-y-auto scrollbar-gutter-outside scrollbar-clean bg-gray-800 mt-1 pr-4">
        <For each={props.filteredTemplates}>
          {(template) => {
            return (
              <>
                <ItemView
                  item={() => ({
                    ...createItem({
                      id: 1,
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
