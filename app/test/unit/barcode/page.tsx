'use client';

import MealItem from "@/app/MealItem";
import { Alert, Breadcrumb } from "flowbite-react";
import { useEffect, useState } from "react";
import { mockFood } from "../(mock)/mockData";
import { Html5QrcodeResult, Html5QrcodeScanType, Html5QrcodeScanner } from "html5-qrcode";
import { Html5QrcodeError, Html5QrcodeSupportedFormats } from "html5-qrcode/esm/core";
import { Html5QrcodeScannerConfig } from "html5-qrcode/esm/html5-qrcode-scanner";
export default function Page() {
    function onScanSuccess(decodedText: string, decodedResult: Html5QrcodeResult) {
        // handle the scanned code as you like, for example:
        console.log(`Code matched = ${decodedText}`, decodedResult);
    }

    function onScanFailure(errorMessage: string, error: Html5QrcodeError) {
        // handle scan failure, usually better to ignore and keep scanning.
        // for example:
        console.warn(`Code scan error = ${error}`);
    }

    let qrboxFunction = function (viewfinderWidth, viewfinderHeight) {
        let minEdgePercentage = 0.7; // 70%
        let minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
        let qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
        return {
            width: qrboxSize,
            height: qrboxSize
        };
    }

    useEffect(() => {
        let config: Html5QrcodeScannerConfig = {
            fps: 10,
            qrbox: qrboxFunction,
            rememberLastUsedCamera: true,
            // Only support camera scan type.
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
            formatsToSupport: [Html5QrcodeSupportedFormats.EAN_13],
        };

        let html5QrcodeScanner = new Html5QrcodeScanner(
            "reader", config, /* verbose= */ false);
        html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    }, []);

    return (
        <>
            <div id="reader" style={{ width: "1200px" }}></div>
        </>
    );
}