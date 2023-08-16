import MealView from '@/app/(meal)/MealView'
import App from '@/app/App'
import { mockMeal } from '@/app/test/unit/(mock)/mockData'
import { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof MealView> = {
  title: 'Components/MealView',
  component: MealView,
  decorators: [(Story) => <App>{Story()}</App>], // TODO: Create <MockApp> to provide context to all stories
}

export default meta
type Story = StoryObj<typeof MealView>

export const Root: Story = {
  args: {
    mealData: mockMeal(), // TODO: display group with 3 (orange), group with 1 (white), and recipe (blue)
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
