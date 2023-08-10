import type { Meta, StoryObj } from '@storybook/react'
import FoodItemEditModal, {
  FoodItemEditModalProps,
} from '../app/(foodItem)/FoodItemEditModal'
import { mockItem } from '@/app/test/unit/(mock)/mockData'

const meta: Meta<typeof FoodItemEditModal> = {
  component: FoodItemEditModal,
  argTypes: {
    targetNameColor: {
      control: {
        type: 'text',
      },
    },
  },
  decorators: [
    (Story) => {
      return Story()
    },
  ],
}

export default meta
type Story = StoryObj<typeof FoodItemEditModal>

export const Root: Story = {
  args: {
    show: true,
    foodItem: mockItem(),
    modalId: 'teste123',
    onApply: () => undefined,
    targetName: 'Teste',
  } satisfies FoodItemEditModalProps,
  render: (args) => <FoodItemEditModal {...args} ref={null} />,
}
