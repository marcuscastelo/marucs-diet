import { createEffect, createSignal } from 'solid-js'

/**
 * Chart type options for weight evolution visualization
 */
export type WeightChartType = '7d' | '14d' | '30d' | '6m' | '1y' | 'all'

/**
 * Available chart type options with display labels
 */
export const WEIGHT_CHART_OPTIONS = [
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '14d', label: 'Últimos 14 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '6m', label: 'Últimos 6 meses' },
  { value: '1y', label: 'Último ano' },
  { value: 'all', label: 'Todo o período' },
] as const

const STORAGE_KEY = 'weight-evolution-chart-type'

/**
 * Gets the stored chart type from localStorage or returns default
 */
function getStoredChartType(): WeightChartType {
  if (typeof window === 'undefined') {
    return 'all'
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  const validTypes = ['7d', '14d', '30d', '6m', '1y', 'all'] as const

  // TODO: Make tuple.includes narrow item type if tuple is const
  if (stored !== null && validTypes.includes(stored)) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return stored as WeightChartType
  }

  return 'all'
}

/**
 * Stores the chart type to localStorage
 */
function storeChartType(chartType: WeightChartType): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, chartType)
  }
}

/**
 * Reactive chart type signal with localStorage persistence
 */
const [chartType, setChartType] =
  createSignal<WeightChartType>(getStoredChartType())

/**
 * Effect to persist chart type changes to localStorage
 */
createEffect(() => {
  storeChartType(chartType())
})

/**
 * Exported chart type accessor and setter
 */
export const weightChartType = chartType
export const setWeightChartType = setChartType
