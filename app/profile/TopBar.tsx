'use client';

import UserSelector from "../UserSelector";

export default function TopBar() {
    return (
        <div className={`bg-slate-600 p-4 flex justify-between`}>
            <a href="/" className={`my-auto text-xl`}>Home</a>
            <UserSelector />
        </div>
    );
}
