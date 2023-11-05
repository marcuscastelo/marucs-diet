import { SolidApexCharts } from 'solid-apexcharts'
import { createSignal } from 'solid-js'
import ptBrLocale from '~/assets/locales/apex/pt-br.json'

export function TestChart() {
  const [options] = createSignal<ApexCharts.ApexOptions>({
    theme: {
      mode: 'dark',
    },
    chart: {
      id: 'solidchart-example',
      locales: [ptBrLocale],
      defaultLocale: 'pt-br',
      background: '#1a202c',
      toolbar: {
        tools: {
          download: false,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: true,
        },
      },
    },
  })
  const [series] = createSignal({
    list: [
      {
        name: 'series-1',
        data: [
          {
            x: 'Teste1',
            y: [51.98, 56.29, 51.59, 53.85],
          },
          {
            x: 'Teste3',
            y: [53.66, 54.99, 51.35, 52.95],
          },
          {
            x: 'Teste',
            y: [52.76, 57.35, 52.15, 57.03],
          },
        ],
      },
    ],
  })

  // options and series can be a store or signal

  return (
    <SolidApexCharts
      type="candlestick"
      options={options()}
      series={series().list}
    />
  )
}
