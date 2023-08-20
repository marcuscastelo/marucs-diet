'use client'

import MacroNutrientsView from '../../../MacroNutrientsView'

export default function MacrosPage() {
  const props = { carbs: 123, protein: 222, fat: 321 }

  return (
    <>
      <MacroNutrientsView {...props} />
    </>
  )
}
