import {
  Html5Qrcode,
  type Html5QrcodeFullConfig,
  type Html5QrcodeResult,
  Html5QrcodeSupportedFormats,
} from 'html5-qrcode'
import { createEffect, createSignal, onCleanup, Show } from 'solid-js'

import { LoadingRing } from '~/sections/common/components/LoadingRing'
import { handleScannerError } from '~/shared/error/errorHandler'

export function EANReader(props: {
  id: string
  enabled: boolean
  onScanned: (EAN: string) => void
}) {
  const [loadingScanner, setLoadingScanner] = createSignal(true)

  createEffect(() => {
    if (!props.enabled) return
    setLoadingScanner(true)

    function onScanSuccess(
      decodedText: string,
      decodedResult: Html5QrcodeResult,
    ) {
      if (
        decodedResult.result.format?.format !==
        Html5QrcodeSupportedFormats.EAN_13
      ) {
        console.warn(
          `Atenção: Formato de código de barras não suportado: ${decodedResult.result.format?.format}`,
        )
        console.warn(`Código de barras lido: ${decodedText}`)
      }

      props.onScanned(decodedText)
    }

    const qrboxFunction = function (
      viewfinderWidth: number,
      viewfinderHeight: number,
    ) {
      const minEdgePercentage = 0.7 // 70%
      const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight)
      const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage)
      return {
        width: qrboxSize,
        height: (qrboxSize * 2) / 3,
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
        Html5QrcodeSupportedFormats.UPC_EAN_EXTENSION,
      ],
      verbose: false,
      useBarCodeDetectorIfSupported: true,
    }

    const html5QrcodeScanner = new Html5Qrcode(props.id, config)
    const didStart = html5QrcodeScanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: qrboxFunction },
        onScanSuccess,
        undefined,
      )
      .then(() => {
        setLoadingScanner(false)
        return true
      })
      .catch((err) => {
        handleScannerError(err, {
          component: 'EANReader',
          operation: 'startScanner',
        })
        return false
      })

    onCleanup(() => {
      didStart
        .then(async () => {
          await html5QrcodeScanner.stop().catch((err) => {
            handleScannerError(err, {
              component: 'EANReader',
              operation: 'stopScanner',
            })
          })
        })
        .catch(() => {
          console.log('Error stopping scanner')
        })
    })
  })
  return (
    <>
      <Show when={loadingScanner()}>
        <LoadingRing />
      </Show>
      <div id={props.id} class="mx-auto w-full" />
    </>
  )
}
