import { SolidApexCharts } from 'solid-apexcharts'
import { createSignal } from 'solid-js'

// TODO: apexcharts.esm.js?v=55c99a60:5 Uncaught (in promise) Error: Wrong locale name provided. Please make sure you set the correct locale name in options
// at t.value (apexcharts.esm.js?v=55c99a60:5:181477)
// at t.value (apexcharts.esm.js?v=55c99a60:9:46335)
// at apexcharts.esm.js?v=55c99a60:9:21999
// at new Promise (<anonymous>)
// at t.value (apexcharts.esm.js?v=55c99a60:9:21788)
// at init (dev.jsx:30:11)
// at dev.jsx:33:5
// at untrack (chunk-5AFA2RXD.js?v=55c99a60:473:12)
// at Object.fn (chunk-5AFA2RXD.js?v=55c99a60:498:22)
// at runComputation (chunk-5AFA2RXD.js?v=55c99a60:740:22)
export function TestChart() {
  const [options] = createSignal<ApexCharts.ApexOptions>({
    theme: {
      mode: 'dark',
    },
    chart: {
      id: 'solidchart-example',
      locales: [],
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
