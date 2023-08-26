import type { Meta, StoryObj } from '@storybook/react'
import ItemGroupEditModal, {
  ItemGroupEditModalProps,
} from '../app/(itemGroup)/ItemGroupEditModal'
import {
  mockMeal,
  mockRecipedGroup,
  mockSimpleGroup,
} from '@/app/test/unit/(mock)/mockData'
import ServerApp from '@/app/ServerApp'

const meta: Meta<typeof ItemGroupEditModal> = {
  title: 'Components/ItemGroupEditModal',
  component: ItemGroupEditModal,
  argTypes: {},
  decorators: [(Story) => <ServerApp>{Story()}</ServerApp>], // TODO: Create <MockApp> to provide context to all stories
}

export default meta
type Story = StoryObj<typeof ItemGroupEditModal>

export const Simple: Story = {
  args: {
    show: true,
    modalId: 'teste123',
    onRefetch: () => undefined,
    onSaveGroup: () => undefined,
    targetMealName: 'Teste',
    onCancel: () => undefined,
    onDelete: () => undefined,
    group: mockSimpleGroup(),
  } satisfies ItemGroupEditModalProps,
  render: (args) => <ItemGroupEditModal {...args} />,
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
    group: mockRecipedGroup(),
  } satisfies ItemGroupEditModalProps,
  render: (args) => <ItemGroupEditModal {...args} />,
}
