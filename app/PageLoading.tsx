'use client';

import { useEffect, useState } from "react";
import LoadingRing from "./LoadingRing";

export type PageLoadingProps = {
    message: string;
}

export default function PageLoading({ message }: PageLoadingProps) {
    const [label, setLabel] = useState(message);
    const [tooSlow, setTooSlow] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const dots = label.match(/\./g)?.length || 0;
            if (dots < 3) {
                setLabel(label + '.');
            }
            else {
                setLabel(message);
            }
        }, 300);

        return () => {
            clearInterval(interval);
        }
    }, [label, message]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setTooSlow(true);
        }, 5000);
        return () => {
            clearTimeout(timeout);
        }
    }, []);

    return (
        <div className={`flex w-full h-full min-h-screen justify-center`}>
            <div className="flex flex-col justify-center w-full align-middle">
                <LoadingRing />
                <span className="inline-block text-center w-full">{label}</span>
                {tooSlow && 
                    <span className="inline-block text-center w-full text-red-500">
                        O servidor está demorando para responder. Tente novamente mais tarde.
                    </span>}
            </div>
        </div>
    )
}