import { type Accessor, createSignal } from 'solid-js'

import {
  dayDiets,
  getPreviousDayDiets,
  insertDayDiet,
  updateDayDiet,
} from '~/modules/diet/day-diet/application/dayDiet'
import { type DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'
import {
  showError,
  showSuccess,
} from '~/modules/toast/application/toastManager'
import { Button } from '~/sections/common/components/buttons/Button'
import { lazyImport } from '~/shared/solid/lazyImport'

const { CopyLastDayModal } = lazyImport(
  () => import('~/sections/day-diet/components/CopyLastDayModal'),
  ['CopyLastDayModal'],
)

export function CopyLastDayButton(props: {
  dayDiet: Accessor<DayDiet | undefined>
  selectedDay: string
}) {
  // Modal state
  const [modalOpen, setModalOpen] = createSignal(false)
  const previousDays = () => getPreviousDayDiets(dayDiets(), props.selectedDay)
  const [copyingDay, setCopyingDay] = createSignal<string | null>(null)
  const [copying, setCopying] = createSignal(false)

  async function handleCopy(day: string) {
    setCopyingDay(day)
    setCopying(true)
    const copyFrom = previousDays().find((d) => d.target_day === day)
    if (!copyFrom) {
      setCopying(false)
      setModalOpen(false)
      showError('No matching previous day found to copy.', {
        context: 'user-action',
      })
      return
    }
    const allDays = dayDiets()
    const existing = allDays.find((d) => d.target_day === props.selectedDay)
    const newDay = {
      target_day: props.selectedDay,
      owner: copyFrom.owner,
      meals: copyFrom.meals,
      __type: 'NewDayDiet' as const,
    }
    try {
      if (existing) {
        await updateDayDiet(existing.id, newDay)
      } else {
        await insertDayDiet(newDay)
      }
      setModalOpen(false)
      showSuccess('Dia copiado com sucesso!', { context: 'user-action' })
    } catch (e) {
      showError(e, { context: 'user-action' }, 'Erro ao copiar dia')
    } finally {
      setCopying(false)
      setCopyingDay(null)
    }
  }

  return (
    <>
      <Button
        class="btn-primary w-full mt-3 rounded px-4 py-2 font-bold text-white"
        onClick={() => setModalOpen(true)}
      >
        Copiar dia anterior
      </Button>
      <CopyLastDayModal
        previousDays={previousDays()}
        copying={copying()}
        copyingDay={copyingDay()}
        onCopy={(day) => {
          void handleCopy(day)
        }}
        open={modalOpen}
        setOpen={setModalOpen}
      />
    </>
  )
}
