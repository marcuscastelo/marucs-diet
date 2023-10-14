import { Loadable } from '@/src/legacy/utils/loadable'
import { DbReady } from '@/src/legacy/utils/newDbRecord'
import { User } from '@/src/modules/user/domain/user'
import { Weight } from '@/src/modules/weight/domain/weight'
import { WeightRepository } from '@/src/modules/weight/domain/weightRepository'
import { useCallback, useEffect, useState } from 'react'
import { createContext, useContext } from 'use-context-selector'

export type WeightContextProps = {
  weights: Loadable<Weight[]>
  refetchWeights: () => void
  insertWeight: (weight: DbReady<Weight>) => void
  updateWeight: (weightId: Weight['id'], weight: DbReady<Weight>) => void
  deleteWeight: (weightId: Weight['id']) => void
}

export const WeightContext = createContext<WeightContextProps | null>(null)

function assertedContext(context: WeightContextProps | null) {
  if (!context) {
    throw new Error(
      'useWeightContext must be used within a WeightContextProvider',
    )
  }

  return context
}

// TODO: Use context selectors to avoid unnecessary re-renders
export function useWeightContext() {
  const context = useContext(WeightContext)
  return assertedContext(context)
}

export function WeightContextProvider({
  children,
  userId,
  repository,
}: {
  children: React.ReactNode
  userId: User['id']
  repository: WeightRepository
}) {
  const [weights, setWeights] = useState<Loadable<Weight[]>>({ loading: true })

  const handleFetch = useCallback(() => {
    repository
      .fetchUserWeights(userId)
      .then((weights) =>
        setWeights({ loading: false, errored: false, data: weights }),
      )
  }, [repository, userId])

  const handleInsert = useCallback(
    (weight: DbReady<Weight>) => {
      repository.insertWeight(weight).then(() => handleFetch())
    },
    [handleFetch, repository],
  )

  const handleUpdate = useCallback(
    (weightId: Weight['id'], weight: DbReady<Weight>) => {
      repository.updateWeight(weightId, weight).then(() => handleFetch())
    },
    [handleFetch, repository],
  )

  const handleDelete = useCallback(
    (weightId: Weight['id']) => {
      repository.deleteWeight(weightId).then(() => handleFetch())
    },
    [handleFetch, repository],
  )

  const context: WeightContextProps = {
    weights,
    refetchWeights: handleFetch,
    insertWeight: handleInsert,
    updateWeight: handleUpdate,
    deleteWeight: handleDelete,
  }

  useEffect(() => {
    handleFetch()
  }, [handleFetch])

  return (
    <WeightContext.Provider value={context}>{children}</WeightContext.Provider>
  )
}
