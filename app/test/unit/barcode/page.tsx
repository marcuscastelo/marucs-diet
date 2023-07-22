'use client';

import MealItem from "@/app/MealItem";
import { Alert, Breadcrumb } from "flowbite-react";
import { useEffect, useState } from "react";
import { mockFood } from "../(mock)/mockData";
import { Html5Qrcode, Html5QrcodeFullConfig, Html5QrcodeResult, Html5QrcodeScanType, Html5QrcodeScanner } from "html5-qrcode";
import { Html5QrcodeError, Html5QrcodeSupportedFormats } from "html5-qrcode/esm/core";
import { Html5QrcodeScannerConfig } from "html5-qrcode/esm/html5-qrcode-scanner";
export default function Page() {
    function onScanSuccess(decodedText: string, decodedResult: Html5QrcodeResult) {
        // handle the scanned code as you like, for example:
        console.log(`Code matched = ${decodedText} , result = ${decodedResult.result}`);
        alert(`Code matched = ${decodedText} , result = ${decodedResult.result}`);
    }

    function onScanFailure(errorMessage: string, error: Html5QrcodeError) {
        // handle scan failure, usually better to ignore and keep scanning.
        // for example:
        // console.warn(`Code scan error = ${errorMessage}, error = ${error.type}`);
    }

    let qrboxFunction = function (viewfinderWidth: number, viewfinderHeight: number) {
        let minEdgePercentage = 0.7; // 70%
        let minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
        let qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
        return {
            width: qrboxSize,
            height: qrboxSize
        };
    }

    useEffect(() => {
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
            "reader", config);
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
    }, []);

    return (
        <>
            <div id="reader" style={{ width: "1200px" }}></div>
        </>
    );
}