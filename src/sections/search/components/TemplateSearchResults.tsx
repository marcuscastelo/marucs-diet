import { type Accessor, For, type Setter, Show } from 'solid-js'
import toast from 'solid-toast'
import { deleteRecentFoodByFoodId } from '~/legacy/controllers/recentFood'
import { calcRecipeMacros } from '~/legacy/utils/macroMath'
import { createItem } from '~/modules/diet/item/domain/item'
import { type Food } from '~/modules/diet/food/domain/food'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import { type Template } from '~/modules/diet/template/domain/template'
import { templateSearchTab } from '~/modules/search/application/search'
import {
  currentUserId,
  isFoodFavorite,
  setFoodAsFavorite,
} from '~/modules/user/application/user'
import { Alert } from '~/sections/common/components/Alert'
import { TrashIcon } from '~/sections/common/components/icons/TrashIcon'
import {
  ItemFavorite,
  ItemHeader,
  ItemName,
  ItemNutritionalInfo,
  ItemView,
} from '~/sections/food-item/components/ItemView'
import { handleApiError } from '~/shared/error/errorHandler'

export function TemplateSearchResults(props: {
  search: string
  typing: Accessor<boolean>
  filteredTemplates: readonly Template[]
  setSelectedTemplate: (food: Template) => void
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
          {(_, idx) => {
            const template = () => props.filteredTemplates[idx()]
            return (
              <>
                <ItemView
                  item={() => ({
                    ...createItem({
                      name: template().name,
                      quantity: 100,
                      macros: template().__type === 'Food' 
                        ? (template() as Food).macros 
                        : calcRecipeMacros(template() as Recipe),
                      reference: template().id,
                    }),
                    __type:
                      template().__type === 'Food' ? 'Item' : 'RecipeItem', // TODO: Refactor conversion from template type to group/item types
                  })}
                  class="mt-1"
                  macroOverflow={() => ({
                    enable: false,
                  })}
                  onClick={() => {
                    props.setSelectedTemplate(template())
                    props.setItemEditModalVisible(true)
                    props.setBarCodeModalVisible(false)
                  }}
                  header={
                    <ItemHeader
                      name={<ItemName />}
                      favorite={
                        <ItemFavorite
                          favorite={isFoodFavorite(template().id)}
                          onSetFavorite={(favorite) => {
                            setFoodAsFavorite(template().id, favorite)
                          }}
                        />
                      }
                      // Removes from recent list
                      removeFromListButton={
                        <Show when={templateSearchTab() === 'recent'}>
                          <button
                            class="my-auto pt-2 pl-1 hover:animate-pulse"
                            onClick={(e) => {
                              e.stopPropagation()
                              e.preventDefault()
                              toast
                                .promise(
                                  deleteRecentFoodByFoodId(
                                    currentUserId(),
                                    template().id,
                                  ),
                                  {
                                    loading:
                                      'Removendo alimento da lista de recentes...',
                                    success:
                                      'Alimento removido da lista de recentes com sucesso!',
                                    error:
                                      'Erro ao remover alimento da lista de recentes.',
                                  },
                                )
                                .then(props.refetch)
                                .catch((err) => {
                                  handleApiError(err, {
                                    component: 'TemplateSearchResults',
                                    operation: 'deleteRecentFood',
                                    additionalData: { foodId: template().id }
                                  })
                                })
                            }}
                          >
                            <TrashIcon size={20} />
                          </button>
                        </Show>
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
