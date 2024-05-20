import { For, createSignal } from 'solid-js'
import toast from 'solid-toast'
import { BottomNavigation } from '~/sections/common/components/BottomNavigation'
import { Providers } from '~/sections/common/context/Providers'
import { Toggle } from '~/sections/settings/components/Toggle'

// TODO: Centralize theme constants
const CARD_BACKGROUND_COLOR = 'bg-slate-800'
const CARD_STYLE = 'mt-5 pt-5 rounded-lg'

export default function Page() {
  const toggleSettings = [
    {
      title: 'Modo escuro',
      description: 'Alterna entre o modo claro e escuro',
    },
    {
      title: 'Aviso de macros ultrapassadas',
      description: 'Ao adicionar uma refeição, avisa se ultrapassou macros',
    },
    {
      title: 'Toasts',
      description: 'Habilita ou desabilita as notificações de toasts',
    },
    {
      title: 'Notificações',
      description: 'Habilita ou desabilita as notificações do aplicativo',
    },
    {
      title: 'Sincronização automática',
      description: 'Habilita ou desabilita a sincronização automática',
    },
    {
      title: 'Alertas de peso',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    },
    {
      title: 'Alertas de medidas',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    },
    {
      title: 'Alertas de calorias',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    },
    {
      title: 'Exibir versão do aplicativo',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    },
    {
      title: 'Exibir botão de troca de versão',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    },
    {
      title: 'Exibir cores diferentes para tipos de grupos',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    },
  ]

  const items = toggleSettings.map((data) => {
    const [checked, setChecked] = createSignal(false)
    return {
      name: data.title,
      description: data.description,
      checked,
      setChecked,
    }
  })

  return (
    <Providers>
      <div class={'mx-1 md:mx-40 lg:mx-auto lg:w-1/3 pt-1'}>
        <div
          class={`${CARD_BACKGROUND_COLOR} ${CARD_STYLE} rounded-b-none pb-6`}
        >
          <h1 class={'mx-auto text-center text-3xl font-bold'}>
            Configurações
          </h1>
          <div class="mt-10 px-5 mx-16">
            <For each={items}>
              {({ name, description, checked, setChecked }, idx) => (
                <div class="">
                  <Toggle
                    label={
                      <div>
                        <div class="text-xl">{name}</div>
                        <div class="text-sm text-gray-500">{description}</div>
                      </div>
                    }
                    checked={checked}
                    setChecked={(newChecked) => {
                      setChecked(newChecked)
                      toast.success(
                        `${name} foi ${newChecked ? 'ativado' : 'desativado'}`,
                      )
                    }}
                  />
                  {idx() !== items.length - 1 && (
                    <hr class="bg-gray-500 h-px border-0 rounded my-3" />
                  )}
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </Providers>
  )
}
