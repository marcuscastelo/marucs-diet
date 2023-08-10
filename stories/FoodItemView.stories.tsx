import type { Meta, StoryObj } from '@storybook/react'
import FoodItemView, { FoodItemViewProps } from '../app/(foodItem)/FoodItemView'
import { mockItem } from '@/app/test/unit/(mock)/mockData'

const meta: Meta<typeof FoodItemView> = {
  component: FoodItemView,
}

export default meta
type Story = StoryObj<typeof FoodItemView>

export const Root: Story = {
  args: {
    foodItem: mockItem(),
  } satisfies FoodItemViewProps,
}
