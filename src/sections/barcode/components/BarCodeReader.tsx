import {
  Html5Qrcode,
  type Html5QrcodeFullConfig,
  type Html5QrcodeResult,
  Html5QrcodeSupportedFormats
} from 'html5-qrcode'
import { onCleanup, onMount } from 'solid-js'

export function BarCodeReader (props: {
  id: string
  onScanned: (barcode: string) => void
}) {
  onMount(() => {
    function onScanSuccess (
      decodedText: string,
      decodedResult: Html5QrcodeResult
    ) {
      if (
        decodedResult.result.format?.format !==
        Html5QrcodeSupportedFormats.EAN_13
      ) {
        console.warn(
          `Atenção: Formato de código de barras não suportado: ${decodedResult.result.format?.format}`
        )
        console.warn(`Código de barras lido: ${decodedText}`)
      }

      props.onScanned(decodedText)
    }

    const qrboxFunction = function (
      viewfinderWidth: number,
      viewfinderHeight: number
    ) {
      const minEdgePercentage = 0.7 // 70%
      const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight)
      const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage)
      return {
        width: qrboxSize,
        height: (qrboxSize * 2) / 3
      }
    }

    const config: Html5QrcodeFullConfig = {
      formatsToSupport: [
        Html5QrcodeSupportedFormats.AZTEC,
        Html5QrcodeSupportedFormats.CODABAR,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.CODE_93,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.DATA_MATRIX,
        Html5QrcodeSupportedFormats.MAXICODE,
        Html5QrcodeSupportedFormats.ITF,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.PDF_417,
        Html5QrcodeSupportedFormats.RSS_14,
        Html5QrcodeSupportedFormats.RSS_EXPANDED,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.UPC_EAN_EXTENSION
      ],
      verbose: false,
      useBarCodeDetectorIfSupported: true
    }

    const html5QrcodeScanner = new Html5Qrcode(props.id, config)
    const didStart = html5QrcodeScanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: qrboxFunction },
        onScanSuccess,
        undefined
      )
      .then(() => true)
      .catch((err) => {
        console.error('Error starting scanner', err)
        return false
      })

    onCleanup(() => {
      didStart
        .then(async () => {
          await html5QrcodeScanner.stop().catch(
            (err) => {
              console.error('Error stopping scanner', err)
            }
          )
        })
        .catch(() => {
          console.log('Error stopping scanner')
        })
    })
  })
  return (
    <>
      <div id={props.id} class="mx-auto w-full" />
    </>
  )
}
