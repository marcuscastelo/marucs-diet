"use client";

import { searchBarCode } from "@/controllers/barcodes";
import { BarCodeResult } from "@/model/barCodeResult";
import { useEffect, useState } from "react";

export default function Page() {
    const [loading, setLoading] = useState(false);
    const [barCode, setBarCode] = useState('');
    const [currentResult, setCurrentResult] = useState<BarCodeResult | null>(null);

    useEffect(() => {
        if (barCode.length != 13) {
            return;
        }

        setLoading(true);     
        const promise = searchBarCode(barCode).then((result) => {
            setCurrentResult(result);
        }).catch((err) => {
            console.error(err);
            alert(err);
        }).finally(() => {
            setLoading(false);
        });

        const timeout = setTimeout(() => {
            setLoading(false);
        }, 100000);

        return () => {
            clearTimeout(timeout);
        }
    }, [barCode]);

    return (
        <div>
            <h3 className="font-bold text-lg text-white">Busca por código de barras (EAN)</h3>

            <div className="w-full text-center">
                <div className={`loading loading-lg transition-all ${loading ? 'h-80' : 'h-0'}`} />
            </div>

            {currentResult && (
                <div className="flex flex-col mt-3">
                    <div className="flex">
                        <div className="flex-1">
                            <p className="font-bold">
                                {currentResult.nome}
                            </p>
                            <p className="text-sm">
                                {currentResult.fotoTabelaNutricional}
                            </p>
                        </div>
                    </div>300g
                </div>
            )}

            <div className="flex mt-3">
                <input
                    type="number" placeholder="Código de barras (Ex: 7891234567890)"
                    className={`mt-1 input input-bordered flex-1 bg-gray-800 border-gray-300`}
                    value={barCode} onChange={(e) => setBarCode(e.target.value.slice(0, 13))}
                />
            </div>
        </div>
    )
}