'use client';

import MacroTarget from "@/app/MacroTargets";
import PageLoading from "@/app/PageLoading";
import { updateUser } from "@/controllers/users";
import { setUserJson, useUser } from "@/redux/features/userSlice";
import { useAppDispatch } from "@/redux/hooks";
import Link from "next/link";

export default function Page() {
    const currentUser = useUser();
    const dispatch = useAppDispatch();

    if (currentUser.loading) {
        return <PageLoading message="Carregando usuário" />
    }

    const weight = currentUser.data?.weight;
    const macroProfile = currentUser.data?.macro_profile;

    return (
        <>
            <Link href="/">Home</Link>
            <h1>Profile</h1>
            <p>Current user: {!currentUser.loading ? currentUser.data?.name : 'Loading user...'}</p>
            <span>
                Peso: {weight}
            </span>
            <span>
                Carbo: {macroProfile.gramsPerKgCarbs}
            </span>
            <span>
                Proteina: {macroProfile.gramsPerKgProtein}
            </span>
            <span>
                Gordura: {macroProfile.gramsPerKgFat}
            </span>

            <MacroTarget
                weight={weight}
                profile={macroProfile}
                onSetProfile={async (profile) => {
                    const newUser = {
                        ...currentUser.data,
                        macroProfile: profile,
                    };

                    await updateUser(newUser.id, newUser);
                    dispatch(setUserJson(JSON.stringify(newUser)));
                }}
            ></MacroTarget>
        </>
    );
}