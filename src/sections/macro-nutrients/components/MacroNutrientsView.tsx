import { cn } from '~/shared/cn'
import { type MacroNutrients } from '~/modules/diet/macro-nutrients/domain/macroNutrients'

export default function MacroNutrientsView(props: {
  macros: MacroNutrients
  isMacroOverflowing?: Record<string, () => boolean>
}) {
  const isMacroOverflowing: () => Record<string, () => boolean> = () => ({
    carbs: () => props.isMacroOverflowing?.carbs() ?? false,
    protein: () => props.isMacroOverflowing?.protein() ?? false,
    fat: () => props.isMacroOverflowing?.fat() ?? false,
  })

  return (
    <>
      <span
        class={cn('mr-1 text-green-400', {
          'text-rose-600 dark:text-red-500 animate-pulse font-extrabold uppercase':
            isMacroOverflowing().carbs(),
        })}
      >
        {' '}
        C: {Math.round(props.macros.carbs * 100) / 100}{' '}
      </span>
      <span
        class={cn('mr-1 text-red-700', {
          'text-rose-600 dark:text-red-500 animate-pulse font-extrabold uppercase':
            isMacroOverflowing().protein(),
        })}
      >
        {' '}
        P: {Math.round(props.macros.protein * 100) / 100}{' '}
      </span>
      <span
        class={cn('text-orange-400', {
          'text-rose-600 dark:text-red-500 animate-pulse font-extrabold uppercase':
            isMacroOverflowing().fat(),
        })}
      >
        {' '}
        G: {Math.round(props.macros.fat * 100) / 100}{' '}
      </span>
    </>
  )
}
