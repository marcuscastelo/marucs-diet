import type { Meta, StoryObj } from '@storybook/react'
import RecipeView, { RecipeViewProps } from '../app/(recipe)/RecipeView'
import { mockRecipe } from '@/app/test/unit/(mock)/mockData'
import App from '@/app/App'

const meta: Meta<typeof RecipeView> = {
  component: RecipeView,
  decorators: [(Story) => <App>{Story()}</App>],
}

export default meta
type Story = StoryObj<typeof RecipeView>

export const Root: Story = {
  args: {
    recipe: mockRecipe(),
  } satisfies RecipeViewProps,

  render: (args) => (
    <RecipeView
      {...args}
      header={<RecipeView.Header onUpdateRecipe={() => undefined} />}
      content={<RecipeView.Content onEditItem={() => undefined} />}
      actions={<RecipeView.Actions onNewItem={() => undefined} />}
    />
  ),
}
