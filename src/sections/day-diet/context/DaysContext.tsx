import { useCallback, useEffect } from 'react'
import { Loadable } from '@/legacy/utils/loadable'
import { DayDiet } from '@/modules/diet/day-diet/domain/day'
import { User } from '@/modules/user/domain/user'
import { createContext, useContext } from 'use-context-selector'
import { DbReady } from '@/src/legacy/utils/newDbRecord'
import { DayRepository } from '@/src/modules/diet/day-diet/domain/dayRepository'
import { ReadonlySignal, useSignal } from '@preact/signals-react'

export type DayContextProps = {
  days: ReadonlySignal<Loadable<ReadonlySignal<readonly DayDiet[]>>>
  refetchDays: () => void
  insertDay: (day: DbReady<DayDiet>) => void
  updateDay: (dayId: DayDiet['id'], day: DbReady<DayDiet>) => void
  deleteDay: (dayId: DayDiet['id']) => void
}

const DayContext = createContext<DayContextProps | null>(null)

// TODO: Use context selectors to avoid unnecessary re-renders
export function useDayContext() {
  const context = useContext(DayContext)

  if (!context) {
    throw new Error('useDaysContext must be used within a DaysContextProvider')
  }

  return context
}

export function DayContextProvider({
  children,
  userId,
  repository,
}: {
  children: React.ReactNode
  userId: User['id']
  repository: DayRepository
}) {
  // TODO: Convert all states to signals
  const days = useSignal<Loadable<ReadonlySignal<readonly DayDiet[]>>>({
    loading: true,
  })

  const handleFetchDays = useCallback(() => {
    repository
      .fetchUserDays(userId)
      .then((newDays) => {
        days.value = { loading: false, errored: false, data: newDays }
      })
      .catch((error) => {
        days.value = { loading: false, errored: true, error }
      })
  }, [days, userId, repository])

  const handleInsertDay = useCallback(
    (day: DbReady<DayDiet>) => {
      repository.insertDay(day).then(() => handleFetchDays())
    },
    [handleFetchDays, repository],
  )

  const handleUpdateDay = useCallback(
    (dayId: DayDiet['id'], day: DbReady<DayDiet>) => {
      console.debug(`[DayContextProvider] - Updating day ${dayId} => `, day)
      repository.updateDay(dayId, day).then(() => handleFetchDays())
    },
    [handleFetchDays, repository],
  )

  const handleDeleteDay = useCallback(
    (dayId: DayDiet['id']) => {
      repository.deleteDay(dayId).then(() => handleFetchDays())
    },
    [handleFetchDays, repository],
  )

  useEffect(() => {
    handleFetchDays()
  }, [handleFetchDays])

  const context: DayContextProps = {
    days,
    refetchDays: handleFetchDays,
    insertDay: handleInsertDay,
    updateDay: handleUpdateDay,
    deleteDay: handleDeleteDay,
  }

  return <DayContext.Provider value={context}>{children}</DayContext.Provider>
}
