import type { Meta, StoryObj } from '@storybook/react'
import ItemGroupView, {
  ItemGroupViewProps,
} from '@/app/(itemGroup)/ItemGroupView'

import ServerApp from '@/app/ServerApp'
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
          name={<ItemGroupView.Header.Name />}
          copyButton={
            <ItemGroupView.Header.CopyButton
              onCopyItemGroup={() => console.log('copy meal item')}
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
