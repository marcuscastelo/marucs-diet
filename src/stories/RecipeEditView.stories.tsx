import type { Meta, StoryObj } from '@storybook/react'
import RecipeEditView, {
  RecipeEditViewProps,
} from '@/sections/template/recipe/components/RecipeEditView'
import ServerApp from '@/sections/common/components/ServerApp'
import { signal } from '@preact/signals-react'

const meta: Meta<typeof RecipeEditView> = {
  title: 'Components/RecipeEditView',
  component: RecipeEditView,
  decorators: [(Story) => <ServerApp>{Story()}</ServerApp>], // TODO: Create <MockApp> to provide context to all stories
}

export default meta
type Story = StoryObj<typeof RecipeEditView>

// TODO: fix stories after hexagonal refactor
const recipe = signal(null as any)

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
