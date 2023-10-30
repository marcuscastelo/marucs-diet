'use client'

import { MacroNutrients } from '@/modules/diet/macro-nutrients/domain/macroNutrients'

export default function MacroNutrientsView(props: MacroNutrients) {
  return (
    <>
      <span className="mr-1 text-green-400">
        {' '}
        C: {Math.round(props.carbs * 100) / 100}{' '}
      </span>
      <span className="mr-1 text-red-700">
        {' '}
        P: {Math.round(props.protein * 100) / 100}{' '}
      </span>
      <span className="text-orange-400">
        {' '}
        G: {Math.round(props.fat * 100) / 100}{' '}
      </span>
    </>
  )
}
