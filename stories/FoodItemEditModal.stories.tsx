import type { Meta, StoryObj } from '@storybook/react'
import FoodItemEditModal, {
  FoodItemEditModalProps,
} from '../app/(foodItem)/FoodItemEditModal'
import { mockItem } from '@/app/test/unit/(mock)/mockData'
import App from '@/app/App'

const meta: Meta<typeof FoodItemEditModal> = {
  title: 'Components/FoodItemEditModal',
  component: FoodItemEditModal,
  argTypes: {
    targetNameColor: {
      control: {
        type: 'text',
      },
    },
  },
  decorators: [(Story) => <App>{Story()}</App>],
}

export default meta
type Story = StoryObj<typeof FoodItemEditModal>

export const RootGreen: Story = {
  args: {
    show: true,
    foodItem: mockItem(),
    modalId: 'teste123',
    onApply: () => undefined,
    targetName: 'Teste',
    targetNameColor: 'text-green-500',
  } satisfies FoodItemEditModalProps,
  render: (args) => <FoodItemEditModal {...args} ref={null} />,
}

export const RootBlue: Story = {
  args: {
    show: true,
    foodItem: mockItem(),
    modalId: 'teste123',
    onApply: () => undefined,
    targetName: 'Teste',
    targetNameColor: 'text-blue-500',
  } satisfies FoodItemEditModalProps,
  render: (args) => <FoodItemEditModal {...args} ref={null} />,
}
