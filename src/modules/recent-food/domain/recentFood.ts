// Domain layer for recent food - pure business logic without external dependencies

export type RecentFoodType = 'food' | 'recipe'

// Domain record type for recent food
export type RecentFoodRecord = {
  id: number
  user_id: number
  type: RecentFoodType
  reference_id: number
  last_used: Date
  times_used: number
}

// Input type for creating/updating recent foods
export type RecentFoodInput = {
  user_id: number
  type: RecentFoodType
  reference_id: number
  last_used?: Date
  times_used?: number
}

// Creation params type (for backward compatibility)
export type RecentFoodCreationParams = Partial<RecentFoodRecord> &
  Pick<RecentFoodRecord, 'user_id' | 'type' | 'reference_id'>

// Domain repository interface
export type RecentFoodRepository = {
  fetchByUserTypeAndReferenceId(
    userId: number,
    type: RecentFoodType,
    referenceId: number,
  ): Promise<RecentFoodRecord | null>

  fetchUserRecentFoodsRaw(
    userId: number,
    limit?: number,
    search?: string,
  ): Promise<readonly unknown[]>

  insert(input: RecentFoodInput): Promise<RecentFoodRecord | null>

  update(id: number, input: RecentFoodInput): Promise<RecentFoodRecord | null>

  deleteByReference(
    userId: number,
    type: RecentFoodType,
    referenceId: number,
  ): Promise<boolean>
}

/**
 * Creates a recent food input object (pure domain logic)
 */
export function createRecentFoodInput(
  params: RecentFoodCreationParams,
): RecentFoodInput {
  return {
    user_id: params.user_id,
    type: params.type,
    reference_id: params.reference_id,
    last_used: new Date(),
    times_used: (params.times_used ?? 0) + 1,
  }
}
