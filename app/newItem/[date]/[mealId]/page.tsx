'use client'

import { useRouter } from 'next/navigation'
import FoodSearch from '../../FoodSearch'

type PageProperties = {
  params: {
    date: string
    mealId: string
  }
}

// TODO: Refactor client-side cache vs server-side cache vs no cache logic on search
export default function Page({ params }: PageProperties) {
  const router = useRouter()

  if (isNaN(Number(params.mealId))) {
    return <div>Invalid mealId: {params.mealId}</div>
  }

  return (
    <FoodSearch
      targetName="Não implementado"
      onNewFoodItem={async (foodItem) => {
        alert('TODO: Implement onNewFoodItem') // TODO: Implement onNewFoodItem
      }}
      onFinish={() => {
        router.push(`/day/${params.date}`)
      }}
    />
  )
}
