import { createEffect, createSignal, untrack } from 'solid-js'

import {
  setTargetDay,
  targetDay,
} from '~/modules/diet/day-diet/application/dayDiet'
import { type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import { type Item } from '~/modules/diet/item/domain/item'
import {
  createSimpleItemGroup,
  type ItemGroup,
} from '~/modules/diet/item-group/domain/itemGroup'
import { type Meal } from '~/modules/diet/meal/domain/meal'
import {
  itemGroupToUnifiedItem,
  itemToUnifiedItem,
} from '~/modules/diet/unified-item/domain/conversionUtils'
import { showSuccess } from '~/modules/toast/application/toastManager'
import { TestChart } from '~/sections/common/components/charts/TestChart'
import { FloatInput } from '~/sections/common/components/FloatInput'
import { EANIcon } from '~/sections/common/components/icons/EANIcon'
import { LoadingRing } from '~/sections/common/components/LoadingRing'
import { Modal } from '~/sections/common/components/Modal'
import { PageLoading } from '~/sections/common/components/PageLoading'
import ToastTest from '~/sections/common/components/ToastTest'
import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import { ModalContextProvider } from '~/sections/common/context/ModalContext'
import { Providers } from '~/sections/common/context/Providers'
import { useFloatField } from '~/sections/common/hooks/useField'
import { Datepicker } from '~/sections/datepicker/components/Datepicker'
import { type DateValueType } from '~/sections/datepicker/types'
import DayMacros from '~/sections/day-diet/components/DayMacros'
import { ExternalTemplateSearchModal } from '~/sections/search/components/ExternalTemplateSearchModal'
import { UnifiedItemEditModal } from '~/sections/unified-item/components/UnifiedItemEditModal'
import { UnifiedItemListView } from '~/sections/unified-item/components/UnifiedItemListView'
import { UnifiedItemNutritionalInfo } from '~/sections/unified-item/components/UnifiedItemNutritionalInfo'
import { UnifiedItemView } from '~/sections/unified-item/components/UnifiedItemView'

export default function TestApp() {
  const [unifiedItemEditModalVisible, setUnifiedItemEditModalVisible] =
    createSignal(false)
  const [templateSearchModalVisible, setTemplateSearchModalVisible] =
    createSignal(false)

  const [item] = createSignal<Item>({
    __type: 'Item',
    id: 1,
    macros: {
      carbs: 10,
      protein: 12,
      fat: 10,
    },
    name: 'Teste',
    quantity: 100,
    reference: 31606,
  })

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

  const [meal, setMeal] = createSignal<Meal>({
    id: 1,
    name: 'Teste',
    items: [],
    __type: 'Meal',
  } satisfies Meal)

  createEffect(() => {
    setMeal({
      ...untrack(meal),
      items: [],
    })
  })

  const [dayDiet, setDayDiet] = createSignal<DayDiet>({
    __type: 'DayDiet',
    id: 1,
    meals: [],
    owner: 3,
    target_day: '2023-11-02',
  })

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
            <ModalContextProvider
              visible={templateSearchModalVisible}
              setVisible={setTemplateSearchModalVisible}
            >
              <ExternalTemplateSearchModal
                visible={templateSearchModalVisible}
                setVisible={setTemplateSearchModalVisible}
                targetName="Teste"
                onRefetch={() => {
                  console.debug(item)
                }}
                onNewUnifiedItem={() => {
                  console.debug()
                }}
              />
            </ModalContextProvider>

            <ModalContextProvider
              visible={unifiedItemEditModalVisible}
              setVisible={setUnifiedItemEditModalVisible}
            >
              <UnifiedItemEditModal
                targetMealName="Teste"
                item={() => itemGroupToUnifiedItem(group())}
                macroOverflow={() => ({ enable: false })}
                onApply={(updatedItem) => {
                  // For this test, we'll just log the updated item
                  console.debug('UnifiedItemEditModal onApply:', updatedItem)
                  setUnifiedItemEditModalVisible(false)
                }}
                onCancel={() => {
                  console.debug('cancel')
                  setUnifiedItemEditModalVisible(false)
                }}
                showAddItemButton={true}
                onAddNewItem={() => {
                  console.debug('Add new item requested')
                }}
              />
            </ModalContextProvider>
            <TestModal />
            <TestConfirmModal />
            <button
              class="btn cursor-pointer uppercase"
              onClick={() => {
                setTemplateSearchModalVisible(true)
              }}
            >
              setTemplateSearchModalVisible
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
            <UnifiedItemListView
              items={() => group().items.map(itemToUnifiedItem)}
              mode="edit"
              handlers={{
                onClick: () => {
                  setUnifiedItemEditModalVisible(true)
                },
              }}
            />
            <h1>UnifiedItemView (ItemGroup test)</h1>
            <UnifiedItemView
              item={() => itemGroupToUnifiedItem(group())}
              nutritionalInfo={
                <UnifiedItemNutritionalInfo
                  item={() => itemGroupToUnifiedItem(group())}
                />
              }
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
  const [visible, setVisible] = createSignal(false)

  createEffect(() => {
    console.debug(`[TestModal] Visible: ${visible()}`)
  })

  return (
    <ModalContextProvider visible={visible} setVisible={setVisible}>
      <Modal>
        <Modal.Header title="Test Modal" />
        <Modal.Content>
          <h1>This is a test modal</h1>
          <button
            class="btn cursor-pointer uppercase btn-primary"
            onClick={() => {
              setVisible(false)
            }}
          >
            Close
          </button>
        </Modal.Content>
      </Modal>
      <button onClick={() => setVisible(!visible())}>Open modal!</button>
    </ModalContextProvider>
  )
}

function TestConfirmModal() {
  const { show } = useConfirmModalContext()
  return (
    <button
      onClick={() => {
        show({
          title: 'Teste123',
          body: 'Teste123',
          actions: [
            {
              text: 'Teste123',
              primary: true,
              onClick: () => {
                showSuccess('Teste123')
              },
            },
          ],
        })
      }}
    >
      {' '}
      Open confirm modal{' '}
    </button>
  )
}
