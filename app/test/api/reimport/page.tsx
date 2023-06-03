'use client';

import { deleteAndReimportFoods } from "@/utils/importTBCA";
import { useState } from "react";

export default function Page() {
    const [progress, setProgress] = useState(0);
    const [total, setTotal] = useState(0);

    const onClick = async () => {
        deleteAndReimportFoods(async (total) => {
            setProgress((prev) => prev + 1);
            setTotal(total);
        });
    };

    return (
        <>
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 min-w-full rounded mt-3"
                onClick={onClick}
            >
                DELETE ALL FOOD AND REIMPORT {total != 0 ? `(${progress}/${total})` : '()'}
            </button>
        </>
    )
}