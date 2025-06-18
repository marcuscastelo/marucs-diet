import { Show } from 'solid-js'

import { backendOutage } from '~/shared/error/backendOutageSignal'

export function BackendOutageBanner() {
  return (
    <Show when={backendOutage()}>
      <div class="w-full bg-red-700 text-white text-center py-2 z-50 fixed top-0 left-0 shadow-lg">
        Falha de conexão com o servidor. Algumas funções podem estar
        indisponíveis.
        <a href="https://status.supabase.com/">
          <span class="text-blue-300 hover:underline ml-2">
            Ver status do Supabase
          </span>
        </a>
      </div>
    </Show>
  )
}
