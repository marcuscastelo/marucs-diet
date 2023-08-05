'use client'

import FoodSearch from '../../FoodSearch'

type PageProperties = {
  params: {
    date: string
    mealId: string
  }
}

// TODO: Refactor client-side cache vs server-side cache vs no cache logic on search
export default function Page({ params }: PageProperties) {
  if (isNaN(Number(params.mealId))) {
    return <div>Invalid mealId: {params.mealId}</div>
  }

  return <FoodSearch date={params.date} mealId={Number(params.mealId)} />
}
