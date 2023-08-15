import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { Loadable } from '@/utils/loadable'
import { Day } from '@/model/dayModel'
import { User } from '@/model/userModel'

export type DaysContextProps = {
  days: Loadable<Day[]>
  refetchDays: () => void
}

const DaysContext = createContext<DaysContextProps | null>(null)

// TODO: Use context selectors to avoid unnecessary re-renders
export function useDaysContext() {
  const context = useContext(DaysContext)

  if (!context) {
    throw new Error('useDaysContext must be used within a DaysContextProvider')
  }

  return context
}

export function DaysContextProvider({
  userId,
  onFetchDays,
  children,
}: {
  userId: User['id']
  onFetchDays: (userId: User['id']) => Promise<Day[]>
  children: React.ReactNode
}) {
  const [days, setDays] = useState<Loadable<Day[]>>({ loading: true })

  const handleFetchDays = useCallback(() => {
    setDays({ loading: true })
    onFetchDays(userId)
      .then((days) => {
        setDays({ loading: false, errored: false, data: days })
      })
      .catch((error) => {
        setDays({ loading: false, errored: true, error })
      })
  }, [userId, onFetchDays])

  useEffect(() => {
    handleFetchDays()
  }, [handleFetchDays])

  const context: DaysContextProps = {
    days,
    refetchDays: handleFetchDays,
  }

  return <DaysContext.Provider value={context}>{children}</DaysContext.Provider>
}
