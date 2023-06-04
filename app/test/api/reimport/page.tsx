'use client';

import { importDays } from "@/utils/importDays";
import { deleteAndReimportFoods } from "@/utils/importTBCA";
import { useState } from "react";

export default function Page() {
    const [progress, setProgress] = useState(0);
    const [total, setTotal] = useState(0);

    const [message, setMessage] = useState("");

    const onReimportFood = async () => {
        setMessage("Deleting all foods and reimporting");
        await deleteAndReimportFoods(async (total) => {
            setProgress((prev) => prev + 1);
            setTotal(total);
        });
        setMessage("All foods deleted and reimported");
    };

    const onAddMockDays = async () => {
        setMessage("Adding mock days");
        await importDays();
        setMessage("Mock days added");
    };

    return (
        <>
            <div className="text-2xl font-bold">{message}</div>

            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 min-w-full rounded mt-3"
                onClick={onReimportFood}
            >
                DELETE ALL FOOD AND REIMPORT {total != 0 ? `(${progress}/${total})` : '()'}
            </button>

            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 min-w-full rounded mt-3"
                onClick={onAddMockDays}
            >
                Add today+3 mock days to DB {total != 0 ? `(${progress}/${total})` : '()'}
            </button>
        </>
    )
}