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
import { showSuccess } from '~/modules/toast/application/toastManager'
import { TestChart } from '~/sections/common/components/charts/TestChart'
import { FloatInput } from '~/sections/common/components/FloatInput'
import { HeaderWithActions } from '~/sections/common/components/HeaderWithActions'
import { BarCodeIcon } from '~/sections/common/components/icons/BarCodeIcon'
import { LoadingRing } from '~/sections/common/components/LoadingRing'
import { Modal } from '~/sections/common/components/Modal'
import { PageLoading } from '~/sections/common/components/PageLoading'
import ToastTest from '~/sections/common/components/ToastTest'
import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import { ModalContextProvider } from '~/sections/common/context/ModalContext'
import { Providers } from '~/sections/common/context/Providers'
import { useFloatField } from '~/sections/common/hooks/useField'
import Datepicker from '~/sections/datepicker/components/Datepicker'
import DayMacros from '~/sections/day-diet/components/DayMacros'
import { ItemEditModal } from '~/sections/food-item/components/ItemEditModal'
import { ItemListView } from '~/sections/food-item/components/ItemListView'
import { ItemGroupEditModal } from '~/sections/item-group/components/ItemGroupEditModal'
import {
  ItemGroupCopyButton,
  ItemGroupName,
  ItemGroupView,
  ItemGroupViewNutritionalInfo,
} from '~/sections/item-group/components/ItemGroupView'
import { ExternalTemplateSearchModal } from '~/sections/search/components/ExternalTemplateSearchModal'

export default function TestApp() {
  const [itemEditModalVisible, setItemEditModalVisible] = createSignal(false)
  const [itemGroupEditModalVisible, setItemGroupEditModalVisible] =
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
      id: 1,
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
    groups: [],
    __type: 'Meal',
  } satisfies Meal)

  createEffect(() => {
    setMeal({
      ...untrack(meal),
      groups: [group()],
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

  // const [barCode, setBarCode] = createSignal('')
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
                onNewItemGroup={() => {
                  console.debug()
                }}
              />
            </ModalContextProvider>

            <ModalContextProvider
              visible={itemGroupEditModalVisible}
              setVisible={setItemGroupEditModalVisible}
            >
              <ItemGroupEditModal
                group={group}
                setGroup={(group: ItemGroup | null) =>
                  group !== null && setGroup(group)
                }
                onRefetch={() => {
                  console.debug('refetch')
                }}
                onSaveGroup={(group) => {
                  setGroup(group)
                  setItemGroupEditModalVisible(false)
                }}
                targetMealName="Teste"
                onCancel={() => {
                  console.debug('cancel')
                }}
                onDelete={() => {
                  console.debug('delete')
                }}
              />
            </ModalContextProvider>

            <ModalContextProvider
              visible={itemEditModalVisible}
              setVisible={setItemEditModalVisible}
            >
              <ItemEditModal
                item={item}
                targetName="Teste"
                macroOverflow={() => ({
                  enable: false,
                })}
                onApply={(item) => {
                  console.debug(item)
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
                setItemGroupEditModalVisible(true)
              }}
            >
              setItemGroupEditModalVisible
            </button>
          </div>
        </details>

        {/* Item Group & List */}
        <details>
          <summary class="text-lg cursor-pointer select-none">
            Item Group & List
          </summary>
          <div class="pl-4 flex flex-col gap-2">
            <h1>ItemListView</h1>
            <ItemListView
              items={() => group().items}
              onItemClick={() => {
                setItemEditModalVisible(true)
              }}
            />
            <h1>ItemGroupView</h1>
            <ItemGroupView
              itemGroup={group}
              header={
                <HeaderWithActions
                  name={<ItemGroupName group={group} />}
                  primaryActions={
                    <ItemGroupCopyButton
                      group={group}
                      onCopyItemGroup={(item) => {
                        console.debug(item)
                      }}
                    />
                  }
                />
              }
              nutritionalInfo={<ItemGroupViewNutritionalInfo group={group} />}
              onClick={() => {
                setItemGroupEditModalVisible(true)
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
              onChange={(value) => {
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
            <BarCodeIcon />
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
