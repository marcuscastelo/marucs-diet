import type { Meta, StoryObj } from '@storybook/react'
import {
  RecipeEditModal,
  RecipeEditModalProps,
} from '@/sections/recipe/components/RecipeEditModal'
import ServerApp from '@/sections/common/components/ServerApp'

const meta: Meta<typeof RecipeEditModal> = {
  title: 'Components/RecipeEditModal',
  component: RecipeEditModal,
  argTypes: {},
  decorators: [(Story) => <ServerApp>{Story()}</ServerApp>], // TODO: Create <MockApp> to provide context to all stories
}

export default meta
type Story = StoryObj<typeof RecipeEditModal>

export const Root: Story = {
  args: {
    show: true,
    // TODO: fix stories after hexagonal refactor
    recipe: null as any,
    onSaveRecipe: () => undefined,
    onCancel: () => undefined,
    onVisibilityChange: () => undefined,
    onRefetch: () => undefined,
  } satisfies RecipeEditModalProps,
  render: (args) => <RecipeEditModal {...args} />,
}
