import MealEditView from '@/sections/meal/components/MealEditView'
import ServerApp from '@/sections/common/components/ServerApp'
import { computed } from '@preact/signals-react'
import { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof MealEditView> = {
  title: 'Components/MealEditView',
  component: MealEditView,
  decorators: [(Story) => <ServerApp>{Story()}</ServerApp>], // TODO: Create <MockApp> to provide context to all stories
}

export default meta
type Story = StoryObj<typeof MealEditView>

export const Root: Story = {
  args: {
    // TODO: fix stories after hexagonal refactor
    meal: null as any, // TODO: display group with 3 (orange), group with 1 (white), and recipe (blue)
  },
  render: (args) => (
    <MealEditView
      {...args}
      header={<MealEditView.Header onUpdateMeal={() => undefined} />}
      content={<MealEditView.Content onEditItemGroup={() => undefined} />}
      actions={<MealEditView.Actions onNewItem={() => undefined} />}
    />
  ),
}