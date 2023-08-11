import type { Meta, StoryObj } from '@storybook/react'
import RecipeEditModal, {
  RecipeEditModalProps,
} from '../app/(recipe)/RecipeEditModal'
import { mockRecipe } from '@/app/test/unit/(mock)/mockData'
import App from '@/app/App'

const meta: Meta<typeof RecipeEditModal> = {
  component: RecipeEditModal,
  argTypes: {},
  decorators: [(Story) => <App>{Story()}</App>],
}

export default meta
type Story = StoryObj<typeof RecipeEditModal>

export const Root: Story = {
  args: {
    show: true,
    recipe: mockRecipe(),
    modalId: 'teste123',
    onSaveRecipe: () => undefined,
    onCancel: () => undefined,
    onVisibilityChange: () => undefined,
  } satisfies RecipeEditModalProps,
  render: (args) => <RecipeEditModal {...args} ref={null} />,
}
