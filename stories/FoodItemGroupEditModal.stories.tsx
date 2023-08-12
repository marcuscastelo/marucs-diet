import type { Meta, StoryObj } from '@storybook/react'
import FoodItemGroupEditModal, {
  FoodItemGroupEditModalProps,
} from '../app/(foodItemGroup)/FoodItemGroupEditModal'
import App from '@/app/App'
import { mockDay, mockMeal } from '@/app/test/unit/(mock)/mockData'

const meta: Meta<typeof FoodItemGroupEditModal> = {
  component: FoodItemGroupEditModal,
  argTypes: {},
  decorators: [(Story) => <App>{Story()}</App>],
}

export default meta
type Story = StoryObj<typeof FoodItemGroupEditModal>

export const Simple: Story = {
  args: {
    show: true,
    modalId: 'teste123',
    onRefetch: () => undefined,
    onSaveGroup: () => undefined,
    targetMealName: 'Teste',
    onCancel: () => undefined,
    onDelete: () => undefined,
    onVisibilityChange: () => undefined,
    group: mockMeal().groups[0],
  } satisfies FoodItemGroupEditModalProps,
  render: (args) => <FoodItemGroupEditModal {...args} ref={null} />,
}

export const Recipe: Story = {
  args: {
    show: true,
    modalId: 'teste123',
    onRefetch: () => undefined,
    onSaveGroup: () => undefined,
    targetMealName: 'Teste',
    onCancel: () => undefined,
    onDelete: () => undefined,
    onVisibilityChange: () => undefined,
    group: {
      ...mockMeal().groups[0],
      type: 'recipe',
      recipe: 2,
    },
  } satisfies FoodItemGroupEditModalProps,
  render: (args) => <FoodItemGroupEditModal {...args} ref={null} />,
}
