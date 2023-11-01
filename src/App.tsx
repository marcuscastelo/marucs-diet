import { type FoodItem } from '@/modules/diet/food-item/domain/foodItem'
import { type ItemGroup } from '@/modules/diet/item-group/domain/itemGroup'
import { BackIcon } from '@/sections/common/components/BackIcon'
import ConfirmModal from '@/sections/common/components/ConfirmModal'
import { DatePicker } from '@/sections/common/components/Datepicker'
import { FloatInput } from '@/sections/common/components/FloatInput'
import LoadingRing from '@/sections/common/components/LoadingRing'
import { Modal, ModalHeader } from '@/sections/common/components/Modal'
import PageLoading from '@/sections/common/components/PageLoading'
import { ConfirmModalProvider, useConfirmModalContext } from '@/sections/common/context/ConfirmModalContext'
import { ModalContextProvider } from '@/sections/common/context/ModalContext'
import { useFloatField } from '@/sections/common/hooks/useField'
import FoodItemEditModal from '@/sections/food-item/components/FoodItemEditModal'
import { FoodItemListView } from '@/sections/food-item/components/FoodItemListView'
import ItemGroupView, { ItemGroupCopyButton, ItemGroupHeader, ItemGroupName, ItemGroupViewNutritionalInfo } from '@/sections/item-group/components/ItemGroupView'
import { createEffect, createSignal, untrack } from 'solid-js'

function App () {
  const [foodItemEditModalVisible, setFoodItemEditModalVisible] = createSignal(false)

  const [item] = createSignal<FoodItem>({
    __type: 'FoodItem',
    id: 1,
    macros: {
      carbs: 10,
      protein: 12,
      fat: 10
    },
    name: 'Teste',
    quantity: 100,
    reference: 31606
  })

  const [group, setGroup] = createSignal<ItemGroup>({
    id: 1,
    name: 'Teste',
    quantity: 100,
    type: 'simple',
    items: []
  } satisfies ItemGroup)

  createEffect(() => {
    setGroup({
      ...untrack(group),
      items: [item()]
    })
  })

  return (
    <>
      <ConfirmModalProvider>
        {/* <DatepickerRouter selectedDay='2023-10-30' /> */}
        <ConfirmModal />

        <ModalContextProvider
          visible={foodItemEditModalVisible}
          setVisible={setFoodItemEditModalVisible}
        >
          <FoodItemEditModal
            foodItem={item}
            targetName='Teste'
            onApply={(item) => { console.debug(item) }
            } />
        </ModalContextProvider>
        <h1 class='text-lg'>Oi</h1>
        <button class="btn">Hello daisyUI</button>

        <h1>FoodItemListView</h1>
        <FoodItemListView
          foodItems={() => group().items}
          onItemClick={(item) => { setFoodItemEditModalVisible(true) }}
        />
        <h1>ItemGroupView</h1>
        <ItemGroupView
          itemGroup={group}
          header={
            <ItemGroupHeader
              name={<ItemGroupName group={group} />}
              copyButton={<ItemGroupCopyButton group={group}
                onCopyItemGroup={(item) => { console.debug(item) }} />}
            />
          }
          nutritionalInfo={
            <ItemGroupViewNutritionalInfo group={group} />
          }
        />
        <DatePicker />
        <BackIcon />
        <TestField />
        <TestModal />
        <TestConfirmModal />
        <LoadingRing />
        <PageLoading message='Carregando bugigangas' />
      </ConfirmModalProvider>
    </>
  )
}

function TestField () {
  const testField = useFloatField(() => 0, {
    decimalPlaces: 2
  })

  return (
    <FloatInput field={testField} />
  )
}

function TestModal () {
  const [visible, setVisible] = createSignal(false)

  createEffect(() => {
    console.debug(`[TestModal] Visible: ${visible()}`)
  })

  return (
    <ModalContextProvider visible={visible} setVisible={setVisible}>
      <Modal
        header={
          <ModalHeader title="adf" />
        }
        body={
          <h1>asdfasdf</h1>
        }
      />
      <button onClick={() => setVisible(!visible())}>
        Open modal!
      </button>
    </ModalContextProvider>
  )
}

function TestConfirmModal () {
  const { show } = useConfirmModalContext()
  return (<button onClick={() => {
    show({
      title: 'Teste123',
      body: 'Teste123',
      actions: [
        {
          text: 'Teste123',
          primary: true,
          onClick: () => { alert('Teste123') }
        }
      ]
    })
  }} > Open confirm modal </button>)
}

export default App
