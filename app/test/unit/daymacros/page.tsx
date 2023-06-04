'use client';

import { Progress } from "flowbite-react";

export default function Page() {
    const originalR = 30;
    const r = 120;

    const mul = r / originalR;

    const w = 20 * mul;
    const h = 20 * mul;
    const strokeWidth = 5 * mul;
    const cx = 40 * mul;
    const cy = 40 * mul;
    const circumference = 2 * Math.PI * r;

    return (
        <>
            <div className="flex pt-3">
                <div className="">
                    <div className="radial-progress text-blue-600" style={{
                        "--value": (100 * (2000 / 2500) / 2), "--size": "12rem", "--thickness": "0.7rem",
                        transform: `rotate(90deg) scale(-1, -1)`,
                    }}>
                        <span style={{
                            transform: `rotate(-90deg) scale(-1, -1) translate(0, -0.5rem)`
                        }}>
                            2000/2500 kcal
                        </span>
                    </div>
                </div>
                <div className="w-full">

                <Progress className="" size="sm" textLabelPosition="outside" color="green" textLabel="Carboidrato (10/20g)" labelText={true} progress={50}  />
                <Progress className="" size="sm" textLabelPosition="outside" color="red" textLabel="Proteína (10/20g)" labelText={true} progress={50} />
                <Progress className="" size="sm" textLabelPosition="outside" color="yellow" textLabel="Gordura (10/20g)" labelText={true} progress={50} />
                </div>
            </div>
        </>
    );
}