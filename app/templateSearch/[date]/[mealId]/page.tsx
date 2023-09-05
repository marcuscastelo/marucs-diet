'use client'

import { useRouter } from 'next/navigation'
import { TemplateSearch } from '../../TemplateSearch'

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
    <TemplateSearch
      targetName="Não implementado"
      onNewItemGroup={async () => {
        // TODO: Implement onNewFoodItem
        alert('TODO: Implement onNewItemGroup')
      }}
      onFinish={() => {
        router.push(`/day/${params.date}`)
      }}
    />
  )
}
