"use client";

import { getToday } from "@/utils/dateUtils";
import { useState } from "react";
import Datepicker from "react-tailwindcss-datepicker";
import { DateValueType } from "react-tailwindcss-datepicker/dist/types";

export default function Page() {
    const [value, setValue] = useState<DateValueType>({
        startDate: getToday(),
        endDate: getToday()
    });

    const handleValueChange = (newValue: DateValueType) => {
        console.log("newValue:", newValue);
        setValue(newValue);
    }

    return (
        <>
            <h1 className="text-3xl font-semibold mb-4">Datepicker</h1>
            <Datepicker
                value={value}
                onChange={handleValueChange}
                readOnly={true}
                asSingle={true}
                useRange={false}
            />
        </>
    );
}