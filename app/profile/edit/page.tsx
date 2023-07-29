'use client';

import { useUser } from "@/redux/features/userSlice";
import TopBar from "../TopBar";
import PageLoading from "@/app/PageLoading";
import { User } from "@/model/userModel";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Loadable, Loaded } from "@/utils/loadable";
import { updateUser } from "@/controllers/users";

const INPUT_STYLE = 'mb-5 border text-sm rounded-lg block  p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500 w-full';

export default function Page() {
    const currentUser = useUser();

    const [userDraft, setUserDraft] = useState<Loadable<User>>(currentUser);

    useEffect(() => {
        setUserDraft(currentUser);
    }, [currentUser]);

    if (currentUser.loading || userDraft.loading) {
        return (
            <PageLoading message="Carregando usuário..." />
        );
    }

    return (
        <>
            <TopBar />
            Editar Perfil

            <div className="pt-10">
                <form className="flex flex-col items-center justify-center w-full px-1 sm:mx-auto sm:w-1/2 xl:w-1/4">
                    <UserField label="Nome" fieldName="name" user={userDraft} setUser={setUserDraft} />
                    <UserField label="Peso" fieldName="weight" user={userDraft} setUser={setUserDraft} />
                    <button className="btn btn-primary w-full"
                        onClick={async (e) => {
                            e.preventDefault();
                            await updateUser(userDraft.data.id, userDraft.data);
                        }}
                    >Salvar</button>
                </form>
            </div>
        </>
    );
}

function UserField({
    label,
    fieldName,
    user,
    setUser,
}: {
    label: string,
    fieldName: keyof Omit<User, 'id' | 'favoriteFoods' | 'macroProfile'>,
    user: Loaded<User>,
    setUser: Dispatch<SetStateAction<Loadable<User>>>,
}) {
    return (
        <div className="flex flex-col w-full">
            <label className="text-xl">{label}</label>
            <input
                className={INPUT_STYLE}
                type="text"
                name={fieldName}
                value={user.data[fieldName].toString()}
                onChange={
                    (e) => setUser((old: Loadable<User>) => {
                        //TODO: favoritedFoods will error string cannot be assigned to number
                        return old.loading ? old : {
                            loading: false,
                            data: {
                                ...old.data,
                                [fieldName]: e.target.value,
                            },
                        };
                    })
                } />
        </div>
    );
}