import type { Meta, StoryObj } from '@storybook/react'
import ItemGroupView, {
  ItemGroupViewProps,
} from '@/sections/item-group/components/ItemGroupView'

import ServerApp from '@/sections/common/components/ServerApp'
import { computed } from '@preact/signals-react'

const meta: Meta<typeof ItemGroupView> = {
  title: 'Components/ItemGroupView',
  component: ItemGroupView,
  decorators: [(Story) => <ServerApp>{Story()}</ServerApp>], // TODO: Create <MockApp> to provide context to all stories
  render: (args) => (
    <ItemGroupView
      {...args}
      header={
        <ItemGroupView.Header
          name={<ItemGroupView.Header.Name group={args.itemGroup} />}
          copyButton={
            <ItemGroupView.Header.CopyButton
              group={args.itemGroup}
              onCopyItemGroup={() => console.log('copy meal item')}
            />
          }
          favorite={<ItemGroupView.Header.Favorite favorite={false} />}
        />
      }
      nutritionalInfo={<ItemGroupView.NutritionalInfo group={args.itemGroup} />}
    />
  ),
}

export default meta
type Story = StoryObj<typeof ItemGroupView>

// TODO: fix stories after hexagonal refactor
export const Simple: Story = {
  args: {
    itemGroup: computed(() => null as any),
  } satisfies ItemGroupViewProps,
}

// TODO: fix stories after hexagonal refactor
export const Recipe: Story = {
  args: {
    itemGroup: computed(() => null as any),
  } satisfies ItemGroupViewProps,
}
