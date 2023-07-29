'use client';

import Link from "next/link";
import UserSelector from "../UserSelector";

export default function TopBar() {
    return (
        <div className={`bg-slate-600 p-4 flex justify-between`}>
            <Link href="/" className={`my-auto text-xl`}>Home</Link>
            <UserSelector />
        </div>
    );
}
