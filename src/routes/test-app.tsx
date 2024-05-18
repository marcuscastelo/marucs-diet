import {
  setTargetDay,
  targetDay,
} from '~/modules/diet/day-diet/application/dayDiet'
import { type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import { type FoodItem } from '~/modules/diet/food-item/domain/foodItem'
import { type ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { type Meal } from '~/modules/diet/meal/domain/meal'
import { BackIcon } from '~/sections/common/components/icons/BackIcon'
import { ConfirmModal } from '~/sections/common/components/ConfirmModal'
import { FloatInput } from '~/sections/common/components/FloatInput'
import { LoadingRing } from '~/sections/common/components/LoadingRing'
import { Modal, ModalHeader } from '~/sections/common/components/Modal'
import { PageLoading } from '~/sections/common/components/PageLoading'
import { TestChart } from '~/sections/common/components/charts/TestChart'
import {
  ConfirmModalProvider,
  useConfirmModalContext,
} from '~/sections/common/context/ConfirmModalContext'
import { ModalContextProvider } from '~/sections/common/context/ModalContext'
import { useFloatField } from '~/sections/common/hooks/useField'
import Datepicker from '~/sections/datepicker/components/Datepicker'
import { FoodItemEditModal } from '~/sections/food-item/components/FoodItemEditModal'
import { FoodItemListView } from '~/sections/food-item/components/FoodItemListView'
import { ItemGroupEditModal } from '~/sections/item-group/components/ItemGroupEditModal'
import {
  ItemGroupView,
  ItemGroupCopyButton,
  ItemGroupHeader,
  ItemGroupName,
  ItemGroupViewNutritionalInfo,
} from '~/sections/item-group/components/ItemGroupView'
import { TemplateSearchModal } from '~/sections/search/components/TemplateSearchModal'
import { createEffect, createSignal, untrack } from 'solid-js'
import DayMacros from '~/sections/day-diet/components/DayMacros'
import { Providers } from '~/sections/common/context/Providers'
import toast from 'solid-toast'
import { BarCodeIcon } from '~/sections/common/components/icons/BarCodeIcon'

export default function TestApp() {
  const [foodItemEditModalVisible, setFoodItemEditModalVisible] =
    createSignal(false)
  const [itemGroupEditModalVisible, setItemGroupEditModalVisible] =
    createSignal(false)
  const [templateSearchModalVisible, setTemplateSearchModalVisible] =
    createSignal(false)

  const [item] = createSignal<FoodItem>({
    __type: 'FoodItem',
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

  const [group, setGroup] = createSignal<ItemGroup>({
    id: 1,
    name: 'Teste',
    quantity: 100,
    type: 'simple',
    items: [],
  } satisfies ItemGroup)

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
    <BarCodeIcon />
      <TestChart />

      <Providers>
        <DayMacros />

        <ModalContextProvider
          visible={templateSearchModalVisible}
          setVisible={setTemplateSearchModalVisible}
        >
          <TemplateSearchModal
            targetName="Teste"
            onFinish={() => {
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
          visible={foodItemEditModalVisible}
          setVisible={setFoodItemEditModalVisible}
        >
          <FoodItemEditModal
            foodItem={item}
            targetName="Teste"
            macroOverflow={() => ({
              enable: false,
            })}
            onApply={(item) => {
              console.debug(item)
            }}
          />
        </ModalContextProvider>
        <h1 class="text-lg">Oi</h1>
        <button
          class="btn"
          onClick={() => {
            setTemplateSearchModalVisible(true)
          }}
        >
          setTemplateSearchModalVisible
        </button>

        <button
          class="btn"
          onClick={() => {
            setItemGroupEditModalVisible(true)
          }}
        >
          setItemGroupEditModalVisible
        </button>

        <h1>MealEditViewList: deletado</h1>
        {/* <MealEditViewList
            mealEditPropsList={() => [{
              meal: meal(),
              header: (<MealEditViewHeader
                onUpdateMeal={(meal) => { setMeal(meal) }}
              />),
              content: (<MealEditViewContent
                onEditItemGroup={(group) => {
                  setGroup(group)
                  setItemGroupEditModalVisible(true)
                }}
              />),
              actions: (<MealEditViewActions
                onNewItem={() => {
                  setTemplateSearchModalVisible(true)
                }}
              />)
            }]}
          /> */}

        <h1>FoodItemListView</h1>
        <FoodItemListView
          foodItems={() => group().items}
          onItemClick={() => {
            setFoodItemEditModalVisible(true)
          }}
        />
        <h1>ItemGroupView</h1>
        <ItemGroupView
          itemGroup={group}
          header={
            <ItemGroupHeader
              name={<ItemGroupName group={group} />}
              copyButton={
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

        {/* <BarCodeReader id='123' onScanned={setBarCode}/>
        <BarCodeSearch barCode={barCode} setBarCode={setBarCode} food={food} setFood={setFood} /> */}
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
        <BackIcon />
        <TestField />
        <TestModal />
        <TestConfirmModal />
        <LoadingRing />
        <PageLoading message="Carregando bugigangas" />
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
      <Modal header={<ModalHeader title="adf" />} body={<h1>asdfasdf</h1>} />
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
                toast.success('Teste123')
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
