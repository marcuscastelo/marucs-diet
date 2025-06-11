import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'

/**
 * Represents a macro contributor entry for UI and application logic.
 * @property item - The food item
 * @property handleApply - Function to apply an edit to the item
 */
export type MacroContributorEntry = {
  item: TemplateItem
  handleApply: (edited: TemplateItem) => Promise<void>
}
