'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
    const router = useRouter();
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        setTimeout(() => {
            router.replace(`/day/${today}`);
        }, 10);
    }, [router, today]);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold">Bem vindo</h1>
            Hoje é {today.split('-').reverse().join('/')}
            <span className="mt-5 loading loading-spinner loading-sm"></span>
        </div>
    );
}