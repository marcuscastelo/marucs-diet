import type { Meta, StoryObj } from '@storybook/react'
import FoodItemView, { FoodItemViewProps } from '../app/(foodItem)/FoodItemView'
import { mockItem } from '@/app/test/unit/(mock)/mockData'
import ServerApp from '@/app/ServerApp'

const meta: Meta<typeof FoodItemView> = {
  title: 'Components/FoodItemView',
  component: FoodItemView,
  decorators: [(Story) => <ServerApp>{Story()}</ServerApp>], // TODO: Create <MockApp> to provide context to all stories
}

export default meta
type Story = StoryObj<typeof FoodItemView>

export const Root: Story = {
  args: {
    foodItem: mockItem(),
  } satisfies FoodItemViewProps,

  render: (args) => (
    <FoodItemView
      {...args}
      header={
        <FoodItemView.Header
          name={<FoodItemView.Header.Name />}
          copyButton={
            <FoodItemView.Header.CopyButton
              handleCopyFoodItem={() => console.log('copy meal item')}
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
