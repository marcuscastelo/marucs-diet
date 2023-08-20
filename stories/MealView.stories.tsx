import MealEditView from '@/app/(meal)/MealEditView'
import ServerApp from '@/app/ServerApp'
import { mockMeal } from '@/app/test/unit/(mock)/mockData'
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
    mealData: mockMeal(), // TODO: display group with 3 (orange), group with 1 (white), and recipe (blue)
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
