'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
    const router = useRouter();
    const today = new Date().toISOString().split('T')[0];

    ([1,2,3] as const).includes(4)

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.replace(`/day/${today}`);
        }, 10);

        return () => {
            clearTimeout(timeout);
        }
    }, [router, today]);
    
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold">Bem vindo</h1>
            Hoje é {today.split('-').reverse().join('/')}
            <span className="mt-5 loading loading-spinner loading-sm"></span>
        </div>
    );
}