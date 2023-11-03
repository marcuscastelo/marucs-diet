import {
  MealEditView,
  type MealEditViewProps
} from '@/sections/meal/components/MealEditView'
import { For, type Accessor } from 'solid-js'

export type DayMealsProps = {
  mealEditPropsList: Accessor<MealEditViewProps[]>
  class?: string
}

export function MealEditViewList (props: DayMealsProps) {
  return (
    <div class={props.class}>
      <For each={props.mealEditPropsList()}>
        {(_, index) => {
          const mealPropsSignal = () => props.mealEditPropsList()[index()]
          return (
            <MealEditView
              {...mealPropsSignal()}
              class="mt-2"
            />
          )
        }}
      </For>
    </div>
  )
}
