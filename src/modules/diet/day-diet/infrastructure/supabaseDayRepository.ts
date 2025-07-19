import { type Accessor, createSignal } from 'solid-js'

import {
  type DayDiet,
  dayDietSchema,
  type NewDayDiet,
} from '~/modules/diet/day-diet/domain/dayDiet'
import { type DayRepository } from '~/modules/diet/day-diet/domain/dayDietRepository'
import {
  createDayDietDAOFromNewDayDiet,
  createInsertLegacyDayDietDAOFromNewDayDiet,
  daoToDayDiet,
  type DayDietDAO,
} from '~/modules/diet/day-diet/infrastructure/dayDietDAO'
import {
  type LegacyMeal,
  migrateLegacyMealsToUnified,
} from '~/modules/diet/day-diet/infrastructure/migrationUtils'
import { type User } from '~/modules/user/domain/user'
import {
  createErrorHandler,
  wrapErrorWithStack,
} from '~/shared/error/errorHandler'
import supabase from '~/shared/utils/supabase'

export const SUPABASE_TABLE_DAYS = 'days'

const errorHandler = createErrorHandler('infrastructure', 'DayDiet')

export function createSupabaseDayRepository(): DayRepository {
  return {
    // fetchAllUserDayIndexes: fetchUserDayIndexes,
    fetchAllUserDayDiets,
    fetchDayDiet,
    insertDayDiet,
    updateDayDiet,
    deleteDayDiet,
  }
}

/**
 * // TODO:   Replace userDays with userDayIndexes
 * @deprecated should be replaced by userDayIndexes
 */
const [userDays, setUserDays] = createSignal<readonly DayDiet[]>([])
// const [userDayIndexes, setUserDayIndexes] = createSignal<readonly DayIndex[]>([])

// TODO:   better error handling
/**
 * Fetches a DayDiet by its ID.
 * Throws on error or if not found.
 * @param dayId - The DayDiet ID
 * @returns The DayDiet
 * @throws Error if not found or on API/validation error
 */
async function fetchDayDiet(dayId: DayDiet['id']): Promise<DayDiet> {
  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLE_DAYS)
      .select()
      .eq('id', dayId)

    if (error !== null) {
      errorHandler.error(error)
      throw error
    }

    const dayDiets = Array.isArray(data) ? data : []
    if (dayDiets.length === 0) {
      errorHandler.validationError('DayDiet not found', {
        component: 'supabaseDayRepository',
        operation: 'fetchDayDiet',
        additionalData: { dayId },
      })
      throw new Error('DayDiet not found')
    }
    const result = dayDietSchema.safeParse(dayDiets[0])
    if (!result.success) {
      errorHandler.validationError('DayDiet invalid', {
        component: 'supabaseDayRepository',
        operation: 'fetchDayDiet',
        additionalData: { dayId, parseError: result.error },
      })
      throw new Error('DayDiet invalid')
    }
    return result.data
  } catch (err) {
    errorHandler.error(err)
    throw err
  }
}

/**
 * Type for raw database data before validation
 */
// Legacy data type removed

/**
 * Migrates day data from legacy format (meals with groups) to new format (meals with items)
 * if needed. Returns the data unchanged if it's already in the new format.
 */

// TODO:   better error handling
async function fetchAllUserDayDiets(
  userId: User['id'],
): Promise<Accessor<readonly DayDiet[]>> {
  console.debug(`[supabaseDayRepository] fetchUserDays(${userId})`)
  const { data, error } = await supabase
    .from(SUPABASE_TABLE_DAYS)
    .select()
    .eq('owner', userId)
    .order('target_day', { ascending: true })

  if (error !== null) {
    errorHandler.error(error)
    throw error
  }

  const days = data
    .map((day) => {
      return dayDietSchema.safeParse(day)
    })
    .map((result) => {
      if (result.success) {
        return result.data
      }
      errorHandler.validationError('Error while parsing day', {
        component: 'supabaseDayRepository',
        operation: 'fetchAllUserDayDiets',
        additionalData: { parseError: result.error },
      })
      throw wrapErrorWithStack(result.error)
    })

  console.log('days', days)

  console.debug(
    `[supabaseDayRepository] fetchUserDays returned ${days.length} days`,
  )
  setUserDays(days)

  return userDays
}

// TODO:   Change upserts to inserts on the entire app
const insertDayDiet = async (newDay: NewDayDiet): Promise<DayDiet | null> => {
  // Use direct UnifiedItem persistence (no migration needed)
  const createDAO = createDayDietDAOFromNewDayDiet(newDay)

  const { data: days, error } = await supabase
    .from(SUPABASE_TABLE_DAYS)
    .insert(createDAO)
    .select()
  if (error !== null) {
    throw wrapErrorWithStack(error)
  }

  const dayDAO = days[0] as DayDietDAO | undefined
  if (dayDAO !== undefined) {
    // Data is already in unified format, no migration needed for new inserts
    return daoToDayDiet(dayDAO)
  }
  return null
}

const updateDayDiet = async (
  id: DayDiet['id'],
  newDay: NewDayDiet,
): Promise<DayDiet> => {
  // Use direct UnifiedItem persistence (no migration needed)
  const updateDAO = createDayDietDAOFromNewDayDiet(newDay)

  const { data, error } = await supabase
    .from(SUPABASE_TABLE_DAYS)
    .update(updateDAO)
    .eq('id', id)
    .select()

  if (error !== null) {
    errorHandler.error(error)
    throw error
  }

  const dayDAO = data[0] as DayDietDAO
  // Data is already in unified format, no migration needed for updates
  return daoToDayDiet(dayDAO)
}

const deleteDayDiet = async (id: DayDiet['id']): Promise<void> => {
  const { error } = await supabase
    .from(SUPABASE_TABLE_DAYS)
    .delete()
    .eq('id', id)
    .select()

  if (error !== null) {
    throw wrapErrorWithStack(error)
  }

  const userId = userDays().find((day) => day.id === id)?.owner
  if (userId === undefined) {
    throw new Error(
      `Invalid state: userId not found for day ${id} on local cache`,
    )
  }
}

/**
 * Migra todos os registros legacy do banco de dados para o formato UnifiedItem
 * @returns Estatísticas da migração
 */
export async function migrateLegacyDatabaseRecords(): Promise<{
  totalProcessed: number
  totalMigrated: number
  errors: string[]
}> {
  try {
    console.log('🔍 Buscando registros legacy...')

    // Buscar todos os registros da tabela days
    const { data: allRecords, error: fetchError } = await supabase
      .from(SUPABASE_TABLE_DAYS)
      .select('*')

    if (fetchError !== null) {
      errorHandler.error(fetchError)
      throw fetchError
    }

    const records = allRecords ?? []
    console.log(`📊 Total de registros encontrados: ${records.length}`)

    // Identificar registros legacy (que têm 'groups' ao invés de 'items')
    const legacyRecords = records.filter((record: unknown) => {
      if (
        typeof record !== 'object' ||
        record === null ||
        !('meals' in record) ||
        !Array.isArray((record as { meals: unknown }).meals)
      ) {
        return false
      }

      const recordWithMeals = record as { meals: unknown[] }
      return recordWithMeals.meals.some(
        (meal: unknown) =>
          meal !== null &&
          typeof meal === 'object' &&
          'groups' in meal &&
          !('items' in meal),
      )
    })

    console.log(`🔄 Registros legacy encontrados: ${legacyRecords.length}`)

    if (legacyRecords.length === 0) {
      console.log(
        '✅ Nenhum registro legacy encontrado. Todos os dados já estão no formato UnifiedItem!',
      )
      return { totalProcessed: records.length, totalMigrated: 0, errors: [] }
    }

    // Estatísticas
    let totalMigrated = 0
    const errors: string[] = []

    // Migrar registros em batches
    const batchSize = 10
    for (let i = 0; i < legacyRecords.length; i += batchSize) {
      const batch = legacyRecords.slice(i, i + batchSize)
      console.log(
        `📦 Processando batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(legacyRecords.length / batchSize)} (${batch.length} registros)`,
      )

      for (const record of batch) {
        try {
          // Type guard para garantir que record tem a estrutura esperada
          if (
            typeof record !== 'object' ||
            record === null ||
            !('id' in record) ||
            !('target_day' in record) ||
            !('meals' in record) ||
            !Array.isArray((record as { meals: unknown }).meals)
          ) {
            throw new Error('Estrutura de registro inválida')
          }

          const typedRecord = record as {
            id: number
            target_day: string
            meals: unknown[]
          }

          // Migrar meals do formato legacy para unified
          const migratedMeals = typedRecord.meals.map((meal: unknown) => {
            if (
              meal !== null &&
              typeof meal === 'object' &&
              'groups' in meal &&
              !('items' in meal)
            ) {
              // Este é um meal legacy, migrar usando a função existente
              const legacyMeal = meal as LegacyMeal
              const unifiedMeals = migrateLegacyMealsToUnified([legacyMeal])
              return unifiedMeals[0]
            }
            return meal // Já está no formato unified
          })

          // Atualizar registro no banco usando formato unificado
          const { error: updateError } = await supabase
            .from(SUPABASE_TABLE_DAYS)
            .update({ meals: migratedMeals })
            .eq('id', typedRecord.id)

          if (updateError !== null) {
            throw updateError
          }

          totalMigrated++
          console.log(
            `  ✅ Migrado: day ${typedRecord.id} (${typedRecord.target_day})`,
          )
        } catch (error) {
          const recordId =
            typeof record === 'object' && record !== null && 'id' in record
              ? (record as { id: number }).id
              : 'unknown'
          const errorMsg = `Erro ao migrar registro ${recordId}: ${error instanceof Error ? error.message : String(error)}`
          errors.push(errorMsg)
          console.error(`  ❌ ${errorMsg}`)
          errorHandler.error(error, {
            component: 'supabaseDayRepository',
            operation: 'migrateLegacyDatabaseRecords',
            additionalData: { recordId },
          })
        }
      }

      // Pequena pausa entre batches para evitar sobrecarga
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    console.log('\n📈 Estatísticas da migração:')
    console.log(`  📊 Total de registros: ${records.length}`)
    console.log(`  🔄 Registros legacy encontrados: ${legacyRecords.length}`)
    console.log(`  ✅ Registros migrados com sucesso: ${totalMigrated}`)
    console.log(`  ❌ Erros: ${errors.length}`)

    if (errors.length > 0) {
      console.log('\n❌ Erros encontrados:')
      errors.forEach((error) => console.log(`  - ${error}`))
    }

    return {
      totalProcessed: records.length,
      totalMigrated,
      errors,
    }
  } catch (error) {
    errorHandler.error(error, {
      component: 'supabaseDayRepository',
      operation: 'migrateLegacyDatabaseRecords',
    })
    console.error('💥 Erro fatal durante a migração:', error)
    throw error
  }
}
