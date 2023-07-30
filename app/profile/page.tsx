'use client';

import { useUser } from "@/redux/features/userSlice";
import PageLoading from "../PageLoading";
import { User, userSchema } from "@/model/userModel";
import TopBar from "./TopBar";
import Link from "next/link";
import { Primitive } from "zod";
import { useEffect, useState } from "react";
import { updateUser } from "@/controllers/users";

const CARD_BACKGROUND_COLOR = 'bg-slate-500';
const CARD_STYLE = 'mt-5 pt-5 rounded-lg';

type Translation<T extends string> = { [key in T]: string };

// TODO: Módulo de tradução de enum para string
const DIET_TRANSLATION: Translation<User['diet']> = {
    'cut': 'Cutting',
    'normo': 'Normocalórica',
    'bulk': 'Bulking',
};

// TODO: Módulo de tradução de enum para string
const USER_FIELD_TRANSLATION: Translation<keyof User> = {
    'name': 'Nome',
    'weight': 'Peso',
    'height': 'Altura',
    'diet': 'Dieta',
    'birthdate': 'Data de Nascimento',
    'macro_profile': 'Perfil de Macronutrientes',
    'favorite_foods': 'Alimentos Favoritos',
    'id': 'ID',
};

export default function Page() {
    const { user } = useUser();

    if (user.loading) {
        return (
            <>
                <TopBar />
                <PageLoading message="Carregando usuário..." />
            </>
        );
    }

    return (
        <>
            <TopBar />

            <div className={`mx-1 sm:mx-40 lg:w-1/3 lg:mx-auto`}>
                <BasicInfo />
                <WeightProgress userData={user.data} />
            </div>
        </>
    );
}

function BasicInfo() {
    const { user, setUserJson, fetchUser } = useUser();
    const [innerData, setInnerData] = useState<User | undefined>(user.loading ? undefined : user.data);

    useEffect(() => {
        if (user.loading) {
            return;
        }

        setInnerData(user.data);
    }, [user]);

    if (user.loading || !innerData) {
        return <CardLoading />;
    }

    const makeOnBlur = <T extends keyof User>(field: T, convert: (value: string) => User[T]) => {
        return async (event: React.ChangeEvent<HTMLInputElement>) => {
            event.preventDefault();
            const newUser = { ...user.data };

            newUser[field] = convert(event.target.value);
            const updatedUser = await updateUser(newUser.id, newUser);
            setInnerData(updatedUser);
            setUserJson(JSON.stringify(updatedUser));
        }
    }

    const makeOnChange = <T extends keyof User>(field: T, convert: (value: string) => string) => {
        return (event: React.ChangeEvent<HTMLInputElement>) => {
            event.preventDefault();
            const newUser = { ...user.data };

            newUser[field] = convert(event.target.value) as unknown as User[T];
            setInnerData(newUser);
        }
    }

    const convertString = (value: string) => value;
    const convertNumber = (value: string) => parseFloat(value) || 0;
    const convertDiet = (value: string): User['diet'] =>
        (Object.keys(DIET_TRANSLATION) as User['diet'][])
            .find(key => key === value) ?? 'normo';

    const makeBasicCapsule = <T extends keyof User>(field: T, convert: (value: string) => User[T], extra?: string) =>
        <Capsule
            leftContent={
                <h5 className={`text-xl pl-5`}>{USER_FIELD_TRANSLATION[field]} {extra}</h5>
            }
            rightContent={
                <input
                    className={`text-xl pl-5 input btn-ghost px-0`}
                    value={innerData[field].toString()}
                    onChange={makeOnChange(field, convertString)}
                    onBlur={makeOnBlur(field, convert)}
                    style={{ width: '100%' }}
                />
            }
            className={`mb-2`}
        />
    return (
        <>
            <div className={`${CARD_BACKGROUND_COLOR} ${CARD_STYLE} pb-6 rounded-b-none`}>
                <h5 className={`mx-auto text-center text-3xl font-bold`}>
                    {user.data.name}
                </h5>

                <div className={`text-center text-lg italic mt-3 mb-1`}>
                    Informações
                </div>
                <div className={`mx-5 lg:mx-20`}>
                    {makeBasicCapsule('name', convertString)}
                    {makeBasicCapsule('weight', convertNumber, '(kg)')}
                    {makeBasicCapsule('height', convertNumber, '(cm)')}
                    {makeBasicCapsule('diet', convertDiet)}
                    {makeBasicCapsule('birthdate', convertString)}
                </div>
            </div>
            <Link
                className={`btn btn-primary no-animation w-full rounded-t-none`}
                href="/"
            >
                Salvar
            </Link>
        </>
    )
}

function Capsule({
    leftContent,
    rightContent,
    className,
}: {
    leftContent: React.ReactNode,
    rightContent: React.ReactNode,
    className?: string,
}) {
    return (
        <div className={`flex rounded-3xl overflow-hidden ${className || ''}`}>
            <div className={`flex-1 flex flex-col justify-around text-left bg-slate-700`}>
                {leftContent}
            </div>
            <div className={`flex-1 flex flex-col justify-around text-left bg-slate-900`}>
                {rightContent}
            </div>
        </div>
    );
}

function WeightProgress({
    userData,
}: {
    userData: User,
}) {
    return (
        <div className={`${CARD_BACKGROUND_COLOR} ${CARD_STYLE}`}>
            <h5 className={`mx-auto text-center text-3xl font-bold mb-5`}>
                Progresso do peso
            </h5>
            <div className="mx-20">
                <Capsule
                    leftContent={
                        <h5 className={`text-xl ml-2 p-2`}>Peso Atual (kg)</h5>
                    }
                    rightContent={
                        <h5 className={`text-xl ml-2 p-2`}>0</h5>
                    }
                    className={`mb-2`}
                />
                <Capsule
                    leftContent={
                        <h5 className={`text-xl ml-2 p-2`}>Meta (kg)</h5>
                    }
                    rightContent={
                        <h5 className={`text-xl ml-2 p-2`}>0</h5>
                    }
                    className={`mb-2`}
                />
            </div>
            TODO: Barra de progresso aqui
        </div>
    );
}

const CardLoading = () =>
    <div className={`${CARD_BACKGROUND_COLOR} ${CARD_STYLE} pb-6 rounded-b-none`}>
        <h5 className={`mx-auto text-center text-3xl font-bold animate-pulse`}>
            Carregando...
        </h5>
    </div>