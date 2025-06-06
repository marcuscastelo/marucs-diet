import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import { RecipeEditModal } from '~/sections/recipe/components/RecipeEditModal'
import { ModalContextProvider } from '~/sections/common/context/ModalContext'
import {
  deleteRecipe,
  updateRecipe,
} from '~/modules/diet/recipe/application/recipe'
import { type Accessor, type Setter, Show } from 'solid-js'

export function ExternalRecipeEditModal(props: {
  recipe: Recipe | null
  setRecipe: (recipe: Recipe | null) => void
  visible: Accessor<boolean>
  setVisible: Setter<boolean>
  onRefetch: () => void
}) {
  return (
    <Show when={props.recipe}>
      {(recipe) => (
        <ModalContextProvider
          visible={props.visible}
          setVisible={props.setVisible}
        >
          <RecipeEditModal
            recipe={recipe()}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSaveRecipe={(recipe) => {
              console.debug(
                '[ItemGroupEditModal::ExternalRecipeEditModal] onSaveRecipe:',
                recipe,
              )
              updateRecipe(recipe.id, recipe)
                .then(props.setRecipe)
                .catch((e) => {
                  // TODO:   Remove all console.error from Components and move to application/ folder
                  console.error(
                    '[ItemGroupEditModal::ExternalRecipeEditModal] Error updating recipe:',
                    e,
                  )
                })
            }}
            onRefetch={props.onRefetch}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onDelete={(recipeId) => {
              console.debug(
                '[ItemGroupEditModal::ExternalRecipeEditModal] onDelete:',
                recipeId,
              )

              const afterDelete = () => {
                props.setRecipe(null)
              }

              deleteRecipe(recipeId)
                .then(afterDelete)
                .catch((e) => {
                  console.error(
                    '[ItemGroupEditModal::ExternalRecipeEditModal] Error deleting recipe:',
                    e,
                  )
                })
            }}
          />
        </ModalContextProvider>
      )}
    </Show>
  )
}
