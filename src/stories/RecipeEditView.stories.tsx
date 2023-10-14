import type { Meta, StoryObj } from '@storybook/react'
import RecipeEditView, {
  RecipeEditViewProps,
} from '@/app/(recipe)/RecipeEditView'
import { mockRecipe } from '@/app/test/unit/(mock)/mockData'
import ServerApp from '@/app/ServerApp'
import { signal } from '@preact/signals-react'

const meta: Meta<typeof RecipeEditView> = {
  title: 'Components/RecipeEditView',
  component: RecipeEditView,
  decorators: [(Story) => <ServerApp>{Story()}</ServerApp>], // TODO: Create <MockApp> to provide context to all stories
}

export default meta
type Story = StoryObj<typeof RecipeEditView>

const recipe = signal(mockRecipe())

export const Root: Story = {
  args: {
    recipe,
  } satisfies RecipeEditViewProps,

  render: (args) => (
    <RecipeEditView
      {...args}
      header={<RecipeEditView.Header onUpdateRecipe={() => undefined} />}
      content={
        <RecipeEditView.Content
          onEditItem={() => undefined}
          onNewItem={() => undefined}
        />
      }
    />
  ),
}
