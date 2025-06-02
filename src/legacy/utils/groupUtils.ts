import {
  type ItemGroup,
  type RecipedItemGroup,
  createSimpleItemGroup,
  createRecipedItemGroup,
} from '~/modules/diet/item-group/domain/itemGroup'
import { type Item } from '~/modules/diet/item/domain/item'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import { handleValidationError } from '~/shared/error/errorHandler'

// convertToGroups and GroupConvertible have been migrated to '~/modules/diet/item-group/domain/itemGroup'.
// This file can be deleted if no other legacy utilities remain.
