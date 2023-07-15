"use client";

import { useUser } from "@/utils/localStorage";
import { Dropdown } from "react-daisyui";

export default function UserSelector() {
    const [user, setUser] = useUser();
    const availableUsers = ['Marcus', 'Simone'];

    return (
        <div className="flex items-center">
            <div className="flex-shrink-0">
                <img className="h-10 w-10 rounded-full" src="/user.png" alt="" />
            </div>
            <div className="ml-3 text-center flex flex-col gap-1">
                <div className="text-base font-medium leading-none text-white hover:text-indigo-200 hover:cursor-pointer">{user}</div>
                <div className="text-sm font-medium leading-none text-slate-300">
                    <Dropdown horizontal="left">
                        <Dropdown.Toggle color="ghost" button={false} className="hover:text-indigo-200 hover:cursor-pointer" >Trocar</Dropdown.Toggle>
                        <Dropdown.Menu className="bg-slate-950">
                            {
                                availableUsers.map((user) => {
                                    return (
                                        <Dropdown.Item  
                                            key={user} 
                                            onClick={_ => {
                                                setUser(user);
                                                // Force dropdown to close without having to click outside setting aria
                                                // Credit: https://reacthustle.com/blog/how-to-close-daisyui-dropdown-with-one-click
                                                (document.activeElement as (any | null))?.blur();
                                            }}
                                        >
                                            {user}
                                        </Dropdown.Item>
                                    );
                                })
                            }
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
            <div className="">
            
            </div>
        </div>
    );
}