'use client'
import Capsule from '../Capsule'
const CARD_BACKGROUND_COLOR = 'bg-slate-800'
const CARD_STYLE = 'mt-5 pt-5 rounded-lg'
export default function WeightProgress() {
  return (
    <div className={`${CARD_BACKGROUND_COLOR} ${CARD_STYLE}`}>
      <h5 className={`mx-auto mb-5 text-center text-3xl font-bold`}>
        Progresso do peso
      </h5>
      <div className="mx-20">
        <Capsule
          leftContent={<h5 className={`ml-2 p-2 text-xl`}>Peso Atual (kg)</h5>}
          rightContent={<h5 className={`ml-2 p-2 text-xl`}>0</h5>}
          className={`mb-2`}
        />
        <Capsule
          leftContent={<h5 className={`ml-2 p-2 text-xl`}>Meta (kg)</h5>}
          rightContent={<h5 className={`ml-2 p-2 text-xl`}>0</h5>}
          className={`mb-2`}
        />
      </div>
      TODO: Barra de progresso aqui
    </div>
  )
}
