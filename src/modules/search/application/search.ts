import { createSignal } from 'solid-js'

import {
  type AvailableTab,
  availableTabs,
} from '~/sections/search/components/TemplateSearchTabs'

export const [templateSearch, setTemplateSearch] = createSignal<string>('')
export const [templateSearchTab, setTemplateSearchTab] =
  createSignal<AvailableTab>(availableTabs.Todos.id)
