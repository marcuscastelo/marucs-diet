import { createEffect, createSignal, For, untrack } from 'solid-js'

import {
  setTargetDay,
  targetDay,
} from '~/modules/diet/day-diet/application/dayDiet'
import {
  createNewDayDiet,
  type DayDiet,
  promoteDayDiet,
} from '~/modules/diet/day-diet/domain/dayDiet'
import { migrateLegacyDatabaseRecords } from '~/modules/diet/day-diet/infrastructure/supabaseDayRepository'
import { createItem, type Item } from '~/modules/diet/item/domain/item'
import {
  createSimpleItemGroup,
  type ItemGroup,
} from '~/modules/diet/item-group/domain/itemGroup'
import { createMacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'
import {
  createNewMeal,
  type Meal,
  promoteMeal,
} from '~/modules/diet/meal/domain/meal'
import { itemGroupToUnifiedItem } from '~/modules/diet/unified-item/domain/conversionUtils'
import {
  showError,
  showSuccess,
} from '~/modules/toast/application/toastManager'
import { TestChart } from '~/sections/common/components/charts/TestChart'
import { FloatInput } from '~/sections/common/components/FloatInput'
import { EANIcon } from '~/sections/common/components/icons/EANIcon'
import { LoadingRing } from '~/sections/common/components/LoadingRing'
import { PageLoading } from '~/sections/common/components/PageLoading'
import ToastTest from '~/sections/common/components/ToastTest'
import { Providers } from '~/sections/common/context/Providers'
import { useFloatField } from '~/sections/common/hooks/useField'
import { Datepicker } from '~/sections/datepicker/components/Datepicker'
import { type DateValueType } from '~/sections/datepicker/types'
import DayMacros from '~/sections/day-diet/components/DayMacros'
import { TemplateSearchModal } from '~/sections/search/components/TemplateSearchModal'
import { UnifiedItemView } from '~/sections/unified-item/components/UnifiedItemView'
import {
  openConfirmModal,
  openContentModal,
} from '~/shared/modal/helpers/modalHelpers'
import { openEditModal } from '~/shared/modal/helpers/modalHelpers'

export default function TestApp() {
  const [_unifiedItemEditModalVisible, setUnifiedItemEditModalVisible] =
    createSignal(false)

  const [item] = createSignal<Item>(
    createItem({
      macros: createMacroNutrients({
        carbs: 10,
        protein: 12,
        fat: 10,
      }),
      name: 'Teste',
      quantity: 100,
      reference: 31606,
    }),
  )

  const [group, setGroup] = createSignal<ItemGroup>(
    createSimpleItemGroup({
      name: 'Teste',
      items: [],
    }),
  )

  createEffect(() => {
    setGroup({
      ...untrack(group),
      items: [item()],
    })
  })

  const [meal, setMeal] = createSignal<Meal>(
    promoteMeal(
      createNewMeal({
        name: 'Teste',
        items: [],
      }),
      { id: 1 },
    ),
  )

  createEffect(() => {
    setMeal({
      ...untrack(meal),
      items: [],
    })
  })

  const [dayDiet, setDayDiet] = createSignal<DayDiet>(
    promoteDayDiet(
      createNewDayDiet({
        meals: [],
        owner: 3,
        target_day: '2023-11-02',
      }),
      { id: 1 },
    ),
  )

  createEffect(() => {
    setDayDiet({
      ...untrack(dayDiet),
      meals: [meal()],
    })
  })

  // const [EAN, setEAN] = createSignal('')
  // const [food, setFood] = createSignal<Food | null>(null)
  return (
    <>
      <Providers>
        <DayMacros />

        {/* Modals */}
        <details open>
          <summary class="text-lg cursor-pointer select-none">Modals</summary>
          <div class="pl-4 flex flex-col gap-2">
            {' '}
            <TestModal />
            <TestConfirmModal />
            <button
              class="btn cursor-pointer uppercase"
              onClick={() => {
                openContentModal(
                  () => (
                    <TemplateSearchModal
                      targetName="Teste"
                      onNewUnifiedItem={() => {
                        console.debug('New unified item added')
                      }}
                      onFinish={() => {}}
                      onClose={() => {}}
                    />
                  ),
                  {
                    title: 'Buscar alimentos',
                  },
                )
              }}
            >
              Open Template Search Modal
            </button>
            <button
              class="btn cursor-pointer uppercase"
              onClick={() => {
                setUnifiedItemEditModalVisible(true)
              }}
            >
              setUnifiedItemEditModalVisible
            </button>
          </div>
        </details>

        {/* Item Group & List */}
        <details>
          <summary class="text-lg cursor-pointer select-none">
            Item Group & List
          </summary>
          <div class="pl-4 flex flex-col gap-2">
            <h1>UnifiedItemListView (legacy test)</h1>
            {/* <UnifiedItemListView
              items={() => group().items.map(itemToUnifiedItem)}
              mode="edit"
              handlers={{
                onClick: () => {
                  setUnifiedItemEditModalVisible(true)
                },
              }}
            /> */}
            <h1>UnifiedItemView (ItemGroup test)</h1>
            <UnifiedItemView
              item={() => itemGroupToUnifiedItem(group())}
              handlers={{
                onEdit: () => {
                  setUnifiedItemEditModalVisible(true)
                },
                onCopy: (item) => {
                  console.debug('Copy item:', item)
                },
              }}
            />
          </div>
        </details>

        {/* Datepicker */}
        <details>
          <summary class="text-lg cursor-pointer select-none">
            Datepicker
          </summary>
          <div class="pl-4 flex flex-col gap-2">
            <Datepicker
              asSingle={true}
              useRange={false}
              readOnly={true}
              displayFormat="DD/MM/YYYY"
              value={{
                startDate: targetDay(),
                endDate: targetDay(),
              }}
              onChange={(value: DateValueType) => {
                setTargetDay(value?.startDate as string)
              }}
            />
          </div>
        </details>

        {/* Toasts */}
        <details>
          <summary class="text-lg cursor-pointer select-none">Toasts</summary>
          <div class="pl-4 flex flex-col gap-2 items-center justify-center mx-auto min-h-[20vh] max-w-[33vw]">
            <ToastTest />
          </div>
        </details>

        {/* Migração de Banco */}
        <details>
          <summary class="text-lg cursor-pointer select-none">
            🔄 Migração de Banco
          </summary>
          <div class="pl-4 flex flex-col gap-4">
            <div class="alert alert-warning">
              <div>
                <strong>⚠️ Atenção:</strong> Esta operação migra dados legacy do
                banco para o formato UnifiedItem. Use apenas se necessário.
              </div>
            </div>
            <MigrationSection />
          </div>
        </details>

        {/* Outros */}
        <details>
          <summary class="text-lg cursor-pointer select-none">Outros</summary>
          <div
            class="pl-4 flex flex-col gap-2 items-center justify-center mx-auto"
            style={{ 'min-height': '33vh', 'max-width': '33vw' }}
          >
            <EANIcon />
            <TestChart />
            <TestField />
            <DayMacros />
            <LoadingRing />
            <PageLoading message="Carregando bugigangas" />
          </div>
        </details>
      </Providers>
    </>
  )
}

function TestField() {
  const testField = useFloatField(() => 0, {
    decimalPlaces: 2,
  })

  return <FloatInput field={testField} />
}

function TestModal() {
  return (
    <button
      class="btn cursor-pointer uppercase"
      onClick={() => {
        openEditModal(
          () => (
            <div class="space-y-4">
              <h1>This is a test modal</h1>
              <button
                class="btn cursor-pointer uppercase btn-primary"
                onClick={() => {
                  // Modal will be closed by the unified system
                }}
              >
                Close
              </button>
            </div>
          ),
          {
            title: 'Test Modal',
          },
        )
      }}
    >
      Open modal!
    </button>
  )
}

function TestConfirmModal() {
  return (
    <button
      onClick={() => {
        openConfirmModal('Teste123', {
          title: 'Teste123',
          confirmText: 'Teste123',
          onConfirm: () => {
            showSuccess('Teste123')
          },
        })
      }}
    >
      {' '}
      Open confirm modal{' '}
    </button>
  )
}

function MigrationSection() {
  const [isLoading, setIsLoading] = createSignal(false)
  const [migrationResult, setMigrationResult] = createSignal<{
    totalProcessed: number
    totalMigrated: number
    errors: string[]
  } | null>(null)

  const handleMigration = async () => {
    if (isLoading()) return

    const confirmed = confirm(
      '⚠️ Confirmar Migração\n\n' +
        'Esta operação irá:\n' +
        '• Buscar todos os registros da tabela days\n' +
        '• Identificar dados no formato legacy (meals.groups)\n' +
        '• Converter para formato UnifiedItem (meals.items)\n' +
        '• Atualizar os registros no banco\n\n' +
        'Deseja continuar?',
    )

    if (!confirmed) return

    setIsLoading(true)
    setMigrationResult(null)

    try {
      const result = await migrateLegacyDatabaseRecords()
      setMigrationResult(result)

      if (result.errors.length === 0) {
        showSuccess(
          `✅ Migração concluída! ${result.totalMigrated} registros migrados de ${result.totalProcessed} processados.`,
        )
      } else {
        showError(
          `⚠️ Migração concluída com ${result.errors.length} erros. Verifique os detalhes abaixo.`,
        )
      }
    } catch (error) {
      console.error('Erro na migração:', error)
      showError(
        `❌ Falha na migração: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div class="space-y-4">
      <div class="space-y-2">
        <h3 class="text-lg font-semibold">🔄 Migração Legacy → UnifiedItem</h3>
        <p class="text-sm text-base-content/70">
          Converte dados legacy (meals.groups) para o novo formato UnifiedItem
          (meals.items)
        </p>
      </div>

      <button
        class={`btn btn-warning ${isLoading() ? 'loading' : ''}`}
        onClick={() => void handleMigration()}
        disabled={isLoading()}
      >
        {isLoading() ? 'Executando migração...' : '🚀 Executar Migração'}
      </button>

      {migrationResult() && (
        <div class="card bg-base-200">
          <div class="card-body">
            <h4 class="card-title text-base">📊 Resultado da Migração</h4>
            <div class="stats stats-vertical lg:stats-horizontal">
              <div class="stat">
                <div class="stat-title">Total Processado</div>
                <div class="stat-value text-2xl">
                  {migrationResult()?.totalProcessed}
                </div>
              </div>
              <div class="stat">
                <div class="stat-title">Migrados</div>
                <div class="stat-value text-2xl text-success">
                  {migrationResult()?.totalMigrated}
                </div>
              </div>
              <div class="stat">
                <div class="stat-title">Erros</div>
                <div
                  class={`stat-value text-2xl ${
                    migrationResult()?.errors.length === 0
                      ? 'text-success'
                      : 'text-error'
                  }`}
                >
                  {migrationResult()?.errors.length}
                </div>
              </div>
            </div>

            {migrationResult()?.errors &&
              migrationResult()!.errors.length > 0 && (
                <div class="mt-4">
                  <h5 class="font-semibold text-error mb-2">
                    ❌ Erros encontrados:
                  </h5>
                  <div class="bg-error/10 p-3 rounded">
                    <For each={migrationResult()!.errors}>
                      {(error) => (
                        <div class="text-sm text-error">• {error}</div>
                      )}
                    </For>
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      <div class="text-xs text-base-content/50">
        💡 Dica: Esta operação é idempotente - pode ser executada múltiplas
        vezes com segurança.
      </div>
    </div>
  )
}
