import { type Accessor, type Setter, Show } from 'solid-js'

import {
  deleteRecipe,
  updateRecipe,
} from '~/modules/diet/recipe/application/recipe'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import { ModalContextProvider } from '~/sections/common/context/ModalContext'
import { RecipeEditModal } from '~/sections/recipe/components/RecipeEditModal'

export function ExternalRecipeEditModal(props: {
  recipe: Accessor<Recipe | null>
  setRecipe: (recipe: Recipe | null) => void
  visible: Accessor<boolean>
  setVisible: Setter<boolean>
  onRefetch: () => void
}) {
  return (
    <Show when={props.recipe()}>
      {(recipe) => (
        <ModalContextProvider
          visible={props.visible}
          setVisible={props.setVisible}
        >
          <RecipeEditModal
            recipe={recipe}
            onSaveRecipe={(recipe) => {
              updateRecipe(recipe.id, recipe)
                .then(props.setRecipe)
                .catch((e) => {
                  // TODO: Remove all console.error from Components and move to application/ folder
                  console.error(
                    '[ItemGroupEditModal::ExternalRecipeEditModal] Error updating recipe:',
                    e,
                  )
                })
            }}
            onRefetch={props.onRefetch}
            onDelete={(recipeId) => {
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
