import type { Meta, StoryObj } from '@storybook/react'
import FoodItemView, {
  FoodItemViewProps,
} from '@/sections/food/item/components/FoodItemView'
import ServerApp from '@/sections/common/components/ServerApp'
import { computed } from '@preact/signals-react'
import { createFoodItem } from '../model/foodItemModel'

const meta: Meta<typeof FoodItemView> = {
  title: 'Components/FoodItemView',
  component: FoodItemView,
  decorators: [(Story) => <ServerApp>{Story()}</ServerApp>], // TODO: Create <MockApp> to provide context to all stories
}

export default meta
type Story = StoryObj<typeof FoodItemView>

export const Root: Story = {
  args: {
    foodItem: computed(() =>
      createFoodItem({ name: 'Mock item', reference: 1 }),
    ),
  } satisfies FoodItemViewProps,

  render: (args) => (
    <FoodItemView
      {...args}
      header={
        <FoodItemView.Header
          name={<FoodItemView.Header.Name />}
          copyButton={
            <FoodItemView.Header.CopyButton
              onCopyItem={() => console.log('copy meal item')}
            />
          }
          favorite={
            <FoodItemView.Header.Favorite
              favorite={false}
              onSetFavorite={() => console.log('set favorite')}
            />
          }
        />
      }
      nutritionalInfo={<FoodItemView.NutritionalInfo />}
    />
  ),
}
