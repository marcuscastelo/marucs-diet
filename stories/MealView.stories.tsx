import MealView from '@/app/(meal)/MealView'
import App from '@/app/App'
import { mockMeal } from '@/app/test/unit/(mock)/mockData'
import { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof MealView> = {
  title: 'MealView',
  component: MealView,
  decorators: [(Story) => <App>{Story()}</App>],
}

export default meta
type Story = StoryObj<typeof MealView>

export const Root: Story = {
  args: {
    mealData: mockMeal(),
  },
  render: (args) => (
    <MealView
      {...args}
      header={<MealView.Header onUpdateMeal={() => undefined} />}
      content={<MealView.Content onEditItemGroup={() => undefined} />}
      actions={<MealView.Actions onNewItem={() => undefined} />}
    />
  ),
}
