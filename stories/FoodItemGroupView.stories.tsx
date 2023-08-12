import type { Meta, StoryObj } from '@storybook/react'
import FoodItemGroupView, {
  FoodItemGroupViewProps,
} from '../app/(foodItemGroup)/FoodItemGroupView'
import { mockMeal } from '@/app/test/unit/(mock)/mockData'
import App from '@/app/App'

const meta: Meta<typeof FoodItemGroupView> = {
  title: 'Components/FoodItemGroupView',
  component: FoodItemGroupView,
  decorators: [(Story) => <App>{Story()}</App>],
  render: (args) => (
    <FoodItemGroupView
      {...args}
      header={
        <FoodItemGroupView.Header
          name={<FoodItemGroupView.Header.Name />}
          copyButton={
            <FoodItemGroupView.Header.CopyButton
              handleCopyMealItem={() => console.log('copy meal item')}
            />
          }
          favorite={<FoodItemGroupView.Header.Favorite favorite={false} />}
        />
      }
      nutritionalInfo={<FoodItemGroupView.NutritionalInfo />}
    />
  ),
}

export default meta
type Story = StoryObj<typeof FoodItemGroupView>

export const Simple: Story = {
  args: {
    foodItemGroup: mockMeal().groups[0], // TODO: Create mockGroup()
  } satisfies FoodItemGroupViewProps,
}

export const Recipe: Story = {
  args: {
    // TODO: Create mockGroup()
    foodItemGroup: {
      ...mockMeal().groups[0],
      type: 'recipe',
      recipe: 2,
    },
  } satisfies FoodItemGroupViewProps,
}
