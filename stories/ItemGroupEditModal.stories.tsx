import type { Meta, StoryObj } from '@storybook/react'
import ItemGroupEditModal, {
  ItemGroupEditModalProps,
} from '../app/(itemGroup)/ItemGroupEditModal'
import App from '@/app/App'
import { mockMeal } from '@/app/test/unit/(mock)/mockData'

const meta: Meta<typeof ItemGroupEditModal> = {
  title: 'Components/ItemGroupEditModal',
  component: ItemGroupEditModal,
  argTypes: {},
  decorators: [(Story) => <App>{Story()}</App>], // TODO: Create <MockApp> to provide context to all stories
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
    onVisibilityChange: () => undefined,
    group: mockMeal().groups[0],
  } satisfies ItemGroupEditModalProps,
  render: (args) => <ItemGroupEditModal {...args} ref={null} />,
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
  } satisfies ItemGroupEditModalProps,
  render: (args) => <ItemGroupEditModal {...args} ref={null} />,
}
