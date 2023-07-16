"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Dropdown } from "react-daisyui";
import { setName } from "@/redux/features/userSlice";

export default function UserSelector() {
    const availableUsernames = ['Marcus', 'Simone'];

    const username = useAppSelector(state => state.userReducer.name);
    const dispatch = useAppDispatch();
    const onChangeUsername = (username: string) => dispatch(setName(username));

    return (
        <div className="flex items-center">
            <div className="flex-shrink-0">
                <img className="h-10 w-10 rounded-full" src="/user.png" alt="" />
            </div>
            <div className="ml-3 text-center flex flex-col gap-1">
                <div className="text-base font-medium leading-none text-white hover:text-indigo-200 hover:cursor-pointer">{username}</div>
                <div className="text-sm font-medium leading-none text-slate-300">
                    <Dropdown horizontal="left">
                        <Dropdown.Toggle color="ghost" button={false} className="hover:text-indigo-200 hover:cursor-pointer" >Trocar</Dropdown.Toggle>
                        <Dropdown.Menu className="bg-slate-950">
                            {
                                availableUsernames.map((username) => {
                                    return (
                                        <Dropdown.Item  
                                            key={username} 
                                            onClick={_ => {
                                                onChangeUsername(username);
                                                // Force dropdown to close without having to click outside setting aria
                                                // Credit: https://reacthustle.com/blog/how-to-close-daisyui-dropdown-with-one-click
                                                (document.activeElement as (any | null))?.blur();
                                            }}
                                        >
                                            {username}
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