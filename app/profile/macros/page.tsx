'use client';

import MacroTarget from "@/app/MacroTargets";
import PageLoading from "@/app/PageLoading";
import { updateUser } from "@/controllers/users";
import { useUser } from "@/redux/features/userSlice";
import { useAppDispatch } from "@/redux/hooks";

export default function Page() {
    const { user, setUserJson } = useUser();
    // const dispatch = useAppDispatch(); //TODO: remover do projeto todo esses dispatches

    if (user.loading) {
        return <PageLoading message="Carregando usuário" />
    }

    const weight = user.data?.weight;
    const macroProfile = user.data?.macroProfile;

    return (
        <>
            <a href="/">Home</a>
            <h1>Profile</h1>
            <p>Current user: {!user.loading ? user.data?.name : 'Loading user...'}</p>
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
                        ...user.data,
                        macroProfile: profile,
                    };

                    await updateUser(newUser.id, newUser);
                    setUserJson(JSON.stringify(newUser));
                }}
            ></MacroTarget>
        </>
    );
}