import { useCallback, useEffect } from 'react'
import { Loadable } from '@/legacy/utils/loadable'
import { DayDiet, DayIndex } from '@/modules/diet/day-diet/domain/dayDiet'
import { User } from '@/modules/user/domain/user'
import { createContext, useContext } from 'use-context-selector'
import { DbReady } from '@/src/legacy/utils/newDbRecord'
import { DayRepository } from '@/src/modules/diet/day-diet/domain/dayDietRepository'
import { ReadonlySignal, useSignal } from '@preact/signals-react'

export type DayContextProps = {
  /**
   * @deprecated Use `dayIndexes` instead
   */
  days: ReadonlySignal<Loadable<ReadonlySignal<readonly DayDiet[]>>>
  dayIndexes: ReadonlySignal<Loadable<ReadonlySignal<readonly DayIndex[]>>>
  repository: DayRepository
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
  const days = useSignal<Loadable<ReadonlySignal<readonly DayDiet[]>>>({
    loading: true,
  })

  const dayIndexes = useSignal<Loadable<ReadonlySignal<readonly DayIndex[]>>>({
    loading: true,
  })

  const handleFetchDays = useCallback(() => {
    repository
      .fetchAllUserDayDiets(userId)
      .then((newDays) => {
        days.value = { loading: false, errored: false, data: newDays }
      })
      .catch((error) => {
        days.value = { loading: false, errored: true, error }
      })

    repository
      .fetchAllUserDayIndexes(userId)
      .then((newDayIndexes) => {
        console.debug(
          `[DayContextProvider] - Fetched day indexes for ${userId}:`,
          newDayIndexes,
        )
        dayIndexes.value = {
          loading: false,
          errored: false,
          data: newDayIndexes,
        }
      })
      .catch((error) => {
        dayIndexes.value = { loading: false, errored: true, error }
      })
  }, [days, dayIndexes, userId, repository])

  useEffect(() => {
    handleFetchDays()
  }, [handleFetchDays])

  const context: DayContextProps = {
    days,
    dayIndexes,
    repository,
  }

  return <DayContext.Provider value={context}>{children}</DayContext.Provider>
}
