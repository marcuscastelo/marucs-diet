'use client';

import { BarCodeReader } from "@/app/BarCodeReader";
export default function Page() {
    return <BarCodeReader id="reader" onScanned={alert} />
}
