'use client';

import UserSelector from "@/app/UserSelector";
import { useAppSelector } from "@/redux/hooks";

export default function Page() {
    return (
        <div className="w-64">
            <div className="mb-10">
                <UserSelector/>
            </div>
            
            <code className="text-xs">
                <pre>
                    {JSON.stringify(useAppSelector(state => state.userReducer), null, 4)}
                </pre>
            </code>
        </div>
    )
}