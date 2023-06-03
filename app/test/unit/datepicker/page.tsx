"use client";

import { DarkThemeToggle } from "flowbite-react";
import { useState } from "react";
import Datepicker from "react-tailwindcss-datepicker";
import { DateRangeType, DateValueType } from "react-tailwindcss-datepicker/dist/types";

export default function Page() {
    const [value, setValue] = useState({
        startDate: new Date(),
        endDate: new Date()
    } as DateValueType);

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