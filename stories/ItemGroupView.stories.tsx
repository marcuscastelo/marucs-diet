import type { Meta, StoryObj } from '@storybook/react'
import ItemGroupView, {
  ItemGroupViewProps,
} from '../app/(itemGroup)/ItemGroupView'
import { mockMeal } from '@/app/test/unit/(mock)/mockData'
import App from '@/app/App'
import ServerApp from '@/app/ServerApp'

const meta: Meta<typeof ItemGroupView> = {
  title: 'Components/ItemGroupView',
  component: ItemGroupView,
  decorators: [(Story) => <ServerApp>{Story()}</ServerApp>], // TODO: Create <MockApp> to provide context to all stories
  render: (args) => (
    <ItemGroupView
      {...args}
      header={
        <ItemGroupView.Header
          name={<ItemGroupView.Header.Name />}
          copyButton={
            <ItemGroupView.Header.CopyButton
              handleCopyMealItem={() => console.log('copy meal item')}
            />
          }
          favorite={<ItemGroupView.Header.Favorite favorite={false} />}
        />
      }
      nutritionalInfo={<ItemGroupView.NutritionalInfo />}
    />
  ),
}

export default meta
type Story = StoryObj<typeof ItemGroupView>

export const Simple: Story = {
  args: {
    itemGroup: mockMeal().groups[0], // TODO: Create mockGroup()
  } satisfies ItemGroupViewProps,
}

export const Recipe: Story = {
  args: {
    // TODO: Create mockGroup()
    itemGroup: {
      ...mockMeal().groups[0],
      type: 'recipe',
      recipe: 2,
    },
  } satisfies ItemGroupViewProps,
}
