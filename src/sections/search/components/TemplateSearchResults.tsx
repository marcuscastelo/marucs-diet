import { type Accessor, For, type Setter } from 'solid-js'
import { createFoodItem } from '~/modules/diet/food-item/domain/foodItem'
import { type Template } from '~/modules/diet/template/domain/template'
import {
  isFoodFavorite,
  setFoodAsFavorite,
} from '~/modules/user/application/user'
import { Alert } from '~/sections/common/components/Alert'
import {
  FoodItemFavorite,
  FoodItemHeader,
  FoodItemName,
  FoodItemNutritionalInfo,
  FoodItemView,
} from '~/sections/food-item/components/FoodItemView'

export function TemplateSearchResults(props: {
  search: string
  typing: Accessor<boolean>
  filteredTemplates: readonly Template[]
  setSelectedTemplate: (food: Template) => void
  barCodeModalVisible: Accessor<boolean>
  setBarCodeModalVisible: Setter<boolean>
  foodItemEditModalVisible: Accessor<boolean>
  setFoodItemEditModalVisible: Setter<boolean>
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
                <FoodItemView
                  foodItem={() => ({
                    ...createFoodItem({
                      name: template().name,
                      quantity: 100,
                      macros: template().macros,
                      reference: template().id,
                    }),
                    __type:
                      template().__type === 'Food' ? 'FoodItem' : 'RecipeItem', // TODO: Refactor conversion from template type to group/item types
                  })}
                  class="mt-1"
                  macroOverflow={() => ({
                    enable: false,
                  })}
                  onClick={() => {
                    props.setSelectedTemplate(template())
                    props.setFoodItemEditModalVisible(true)
                    props.setBarCodeModalVisible(false)
                  }}
                  header={
                    <FoodItemHeader
                      name={<FoodItemName />}
                      favorite={
                        <FoodItemFavorite
                          favorite={isFoodFavorite(template().id)}
                          onSetFavorite={(favorite) => {
                            setFoodAsFavorite(template().id, favorite)
                          }}
                        />
                      }
                    />
                  }
                  nutritionalInfo={<FoodItemNutritionalInfo />}
                />
              </>
            )
          }}
        </For>
      </div>
    </>
  )
}
