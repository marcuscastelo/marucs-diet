"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Dropdown } from "react-daisyui";
import { setUserJson } from "@/redux/features/userSlice";
import { useEffect, useState } from "react";
import { User } from "@/model/userModel";
import { listUsers } from "@/controllers/users";
import { Record } from "pocketbase";
import { Loadable } from "@/utils/loadable";
import Link from "next/link";

export default function UserSelector() {
    const [availableUsers, setAvailableUsers] = useState<Loadable<(User)[]>>({ loading: true });
    const [loadingHasTimedOut, setLoadingHasTimedOut] = useState(false);

    const currentUser = useAppSelector(state => state.userReducer);
    const dispatch = useAppDispatch();
    const onChangeUser = (user: User) => dispatch(setUserJson(JSON.stringify(user)));

    useEffect(() => {
        listUsers().then(users => {
            setAvailableUsers({
                loading: false,
                data: users
            });
        });
    }, []);

    useEffect(() => {
        if (!currentUser.loading) {
            setLoadingHasTimedOut(false);
        }

        const timeout = setTimeout(() => {
            if (currentUser.loading) {
                setLoadingHasTimedOut(true);
            }
        }, 500);

        return () => {
            clearTimeout(timeout);
        }
    }, [currentUser]);

    return (
        <div className="flex items-center">
            <div className="flex-shrink-0">
                <img className="h-10 w-10 rounded-full" src="/user.png" alt="" />
            </div>
            <div className="ml-3 text-center flex flex-col gap-1">
                <div className="text-base font-medium leading-none text-white hover:text-indigo-200 hover:cursor-pointer">

                    {
                        currentUser.loading ?
                        (
                            loadingHasTimedOut ?
                            "Deslogado" :
                            "Carregando..."
                            ) :
                            <Link href="/profile">
                                {currentUser.data.name}
                            </Link>
                    }
                </div>
                <div className="text-sm font-medium leading-none text-slate-300">
                    <Dropdown>
                        <Dropdown.Toggle color="ghost" button={false} className="hover:text-indigo-200 hover:cursor-pointer" >
                            { loadingHasTimedOut ? "Entrar" : "Trocar"}
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="bg-slate-950 outline -translate-x-10 translate-y-3 no-animation">
                            {
                                availableUsers.loading ?
                                    (
                                        <Dropdown.Item>Carregando...</Dropdown.Item>
                                    ) :
                                    (
                                        availableUsers.data.map((user, idx) => {
                                            return (
                                                <Dropdown.Item
                                                    key={idx}
                                                    onClick={_ => {
                                                        // Prompt user to confirm
                                                        if (!confirm(`Deseja entrar como ${user.name}?`)) {
                                                            return;
                                                        }

                                                        // Prompt username
                                                        const username = prompt(`Digite '${user.name}':`);
                                                        if (!username) {
                                                            return;
                                                        }

                                                        onChangeUser(user);
                                                        // Force dropdown to close without having to click outside setting aria
                                                        // Credit: https://reacthustle.com/blog/how-to-close-daisyui-dropdown-with-one-click
                                                        (document.activeElement as (any | null))?.blur();
                                                    }}
                                                >
                                                    {user.name}
                                                </Dropdown.Item>
                                            );
                                        })
                                    )
                            }

                            {
                                !availableUsers.loading && availableUsers.data.length === 0 &&
                                <Dropdown.Item>Nenhum usuário disponível</Dropdown.Item>
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