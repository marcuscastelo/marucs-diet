import type { Meta, StoryObj } from '@storybook/react'
import FoodItemEditModal, {
  FoodItemEditModalProps,
} from '../app/(foodItem)/FoodItemEditModal'
import { mockItem } from '@/app/test/unit/(mock)/mockData'
import { ModalContextProvider } from '@/app/(modals)/ModalContext'
import ServerApp from '@/app/ServerApp'
import { signal } from '@preact/signals-react'

const visible = signal(true)

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
  decorators: [
    // TODO: Create <MockApp> to provide context to all stories
    (Story) => (
      <ServerApp>
        <ModalContextProvider visible={visible}>{Story()}</ModalContextProvider>
      </ServerApp>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof FoodItemEditModal>

export const RootGreen: Story = {
  args: {
    foodItem: mockItem(),
    onApply: () => undefined,
    targetName: 'Teste',
    targetNameColor: 'text-green-500',
  } satisfies FoodItemEditModalProps,
  render: (args) => <FoodItemEditModal {...args} />,
}

export const RootBlue: Story = {
  args: {
    foodItem: mockItem(),
    onApply: () => undefined,
    targetName: 'Teste',
    targetNameColor: 'text-blue-500',
  } satisfies FoodItemEditModalProps,
  render: (args) => <FoodItemEditModal {...args} />,
}
