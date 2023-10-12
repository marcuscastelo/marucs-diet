/* eslint-disable @next/next/no-img-element */
'use client'

import BarCodeSearch from '@/app/BarCodeSearch'
import { Food } from '@/model/foodModel'
import { useSignal } from '@preact/signals-react'

export default function Page() {
  const barCode = useSignal<string>('')
  const food = useSignal<Food | null>(null)
  return (
    <>
      <BarCodeSearch barCode={barCode} food={food} />
      EAN: {barCode.value}
      <br />
      Food: {food.value?.name}
    </>
  )
}
