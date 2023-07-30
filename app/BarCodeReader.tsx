'use client';

import { Html5Qrcode, Html5QrcodeFullConfig, Html5QrcodeResult, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { useEffect } from "react";

export function BarCodeReader({
    id,
    onScanned,
}: {
    id: string,
    onScanned: (barcode: string) => void
}) {
    useEffect(() => {
        function onScanSuccess(decodedText: string, decodedResult: Html5QrcodeResult) {
            if (decodedResult.result.format?.format != Html5QrcodeSupportedFormats.EAN_13) {
                console.warn(`Atenção: Formato de código de barras não suportado: ${decodedResult.result.format?.format}`);
                console.warn(`Código de barras lido: ${decodedText}`);
            }

            onScanned(decodedText);
        }

        const onScanFailure = (_: string) => { };

        let qrboxFunction = function (viewfinderWidth: number, viewfinderHeight: number) {
            let minEdgePercentage = 0.7; // 70%
            let minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
            let qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
            return {
                width: qrboxSize,
                height: qrboxSize * 2 / 3,
            };
        }

        let config: Html5QrcodeFullConfig = {
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
        };

        let html5QrcodeScanner = new Html5Qrcode(
            id, config);
        const didStart = html5QrcodeScanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: qrboxFunction },
            onScanSuccess,
            onScanFailure
        ).then(() => true);

        return () => {
            didStart.then(() => html5QrcodeScanner.stop())
                .catch(() => {
                    console.log('Error stopping scanner');
                });
        }
    }, [id, onScanned]);
    return (
        <>
            <div id={id} className="mx-auto w-full"></div>
        </>
    );
}