import type { Meta, StoryObj } from '@storybook/react'
import {
  RecipeEditModal,
  RecipeEditModalProps,
} from '@/app/(recipe)/RecipeEditModal'
import { mockRecipe } from '@/app/test/unit/(mock)/mockData'
import ServerApp from '@/app/ServerApp'

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
    recipe: mockRecipe(),
    onSaveRecipe: () => undefined,
    onCancel: () => undefined,
    onVisibilityChange: () => undefined,
    onRefetch: () => undefined,
  } satisfies RecipeEditModalProps,
  render: (args) => <RecipeEditModal {...args} />,
}
