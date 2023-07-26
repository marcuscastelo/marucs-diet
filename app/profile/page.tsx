'use client';

import { useUser } from "@/redux/features/userSlice";
import PageLoading from "../PageLoading";
import { User } from "@/model/userModel";
import TopBar from "./TopBar";

const CARD_BACKGROUND_COLOR = 'bg-slate-500';
const CARD_STYLE = 'mt-5 pt-5 rounded-lg';

export default function Page() {
    const currentUser = useUser();

    if (currentUser.loading) {
        return (
            <PageLoading message="Carregando usuário..." />
        );
    }

    return (
        <>
            <TopBar/>

            <div className={`mx-40`}>
                <BasicInfo userData={currentUser.data} />
                <WeightProgress userData={currentUser.data} />
            </div>
        </>
    );
}


function BasicInfo({
    userData,
}: {
    userData: User,
}) {
    return (
        <>
            <div className={`${CARD_BACKGROUND_COLOR} ${CARD_STYLE} pb-6 rounded-b-none`}>
                <h5 className={`mx-auto text-center text-3xl font-bold`}>
                    {userData.name}
                </h5>

                <div className={`text-center text-lg italic mt-3 mb-1`}>
                    Informações
                </div>
                <div className={`mx-20`}>
                    <Capsule
                        leftContent={<h5 className={`text-xl`}>Peso (kg)</h5>}
                        rightContent={<h5 className={`text-xl`}>{userData.weight}</h5>}
                        className={`mb-2`}
                    />
                    <Capsule
                        leftContent={<h5 className={`text-xl`}>Altura (cm)</h5>}
                        rightContent={<h5 className={`text-xl`}>{userData.weight * 2}</h5>}
                        className={`mb-2`}
                    />
                    <Capsule
                        leftContent={<h5 className={`text-xl`}>Dieta</h5>}
                        rightContent={<h5 className={`text-xl`}>Normocalórica</h5>}
                        className={`mb-2`}
                    />
                    <Capsule
                        leftContent={<h5 className={`text-xl`}>Idade (anos)</h5>}
                        rightContent={<h5 className={`text-xl`}>70</h5>}
                        className={`mb-2`}
                    />
                </div>
            </div>
            <a
                className={`btn btn-primary no-animation w-full rounded-t-none`}
                href="/profile/edit"
            >
                Editar
            </a>
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
            <div className={`flex-1 text-left pl-5 bg-slate-700`}>
                {leftContent}
            </div>
            <div className={`flex-1 text-left pl-5 bg-slate-900`}>
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
                    leftContent={<h5 className={`text-xl`}>Peso Atual (kg)</h5>}
                    rightContent={<h5 className={`text-xl`}>0</h5>}
                    className={`mb-2`}
                />
                <Capsule
                    leftContent={<h5 className={`text-xl`}>Meta (kg)</h5>}
                    rightContent={<h5 className={`text-xl`}>0</h5>}
                    className={`mb-2`}
                />
            </div>
            TODO: Barra de progresso aqui
        </div>
    );
}