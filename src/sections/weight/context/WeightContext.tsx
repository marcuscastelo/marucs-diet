import { Loadable } from '@/src/legacy/utils/loadable'
import { DbReady } from '@/src/legacy/utils/newDbRecord'
import {
  DEFAULT_USER_ID,
  currentUserId,
} from '@/src/modules/user/application/user'
import { User } from '@/src/modules/user/domain/user'
import { Weight } from '@/src/modules/weight/domain/weight'
import { WeightRepository } from '@/src/modules/weight/domain/weightRepository'
import { ReadonlySignal, useSignal } from '@preact/signals-react'
import { useCallback, useEffect } from 'react'
import { createContext, useContext } from 'use-context-selector'

export type WeightContextProps = {
  weights: ReadonlySignal<Loadable<readonly Weight[]>>
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
  repository,
}: {
  children: React.ReactNode
  repository: WeightRepository
}) {
  const weights = useSignal<Loadable<readonly Weight[]>>({
    loading: true,
  })

  const userId = currentUserId.value ?? DEFAULT_USER_ID

  const handleFetch = useCallback(() => {
    repository.fetchUserWeights(userId).then(
      (newWeights) =>
        (weights.value = {
          loading: false,
          errored: false,
          data: newWeights,
        }),
    )
  }, [repository, userId, weights])

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

  if (currentUserId.value === null) {
    return <div>Usuário não definido</div>
  }

  return (
    <WeightContext.Provider value={context}>{children}</WeightContext.Provider>
  )
}
