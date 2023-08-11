import type { Meta, StoryObj } from '@storybook/react'
import FoodItemGroupView, {
  FoodItemGroupViewProps,
} from '../app/(foodItemGroup)/FoodItemGroupView'
import { mockMeal } from '@/app/test/unit/(mock)/mockData'
import App from '@/app/App'

const meta: Meta<typeof FoodItemGroupView> = {
  component: FoodItemGroupView,
  decorators: [(Story) => <App>{Story()}</App>],
}

export default meta
type Story = StoryObj<typeof FoodItemGroupView>

export const Root: Story = {
  args: {
    foodItemGroup: mockMeal().groups[0], // TODO: Create mockGroup()
  } satisfies FoodItemGroupViewProps,

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
